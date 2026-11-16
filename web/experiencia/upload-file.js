/* Send large TIFFs in parallel parts; the server still validates and stores the original. */
(() => {
  'use strict';
  const MIN_PART_SIZE = 8 * 1024 * 1024;
  const MAX_PARALLEL_PARTS = 3;

  async function send(id, file, onProgress = () => {}) {
    const endpoint = '/api/files/' + encodeURIComponent(id);
    onProgress(0, file.size);
    if (file.size <= MIN_PART_SIZE) {
      const response = await fetch(endpoint, {
        method: 'PUT', headers: {'content-type': 'application/octet-stream'}, body: file
      });
      if (!response.ok) throw new Error('upload ' + response.status);
      onProgress(file.size, file.size);
      return;
    }

    const start = await fetch(endpoint + '/multipart', {
      method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({action:'start'})
    });
    if (!start.ok) throw new Error('multipart start ' + start.status);
    const {uploadId} = await start.json();
    if (typeof uploadId !== 'string' || !uploadId) throw new Error('multipart upload id');

    const partSize = Math.max(MIN_PART_SIZE, Math.ceil(file.size / 9000));
    const count = Math.ceil(file.size / partSize);
    const parts = new Array(count);
    let nextPart = 0;
    let uploadedBytes = 0;
    try {
      const worker = async () => {
        while (nextPart < count) {
          const index = nextPart++;
          const number = index + 1;
          const offset = index * partSize;
          const end = Math.min(offset + partSize, file.size);
          const response = await fetch(endpoint + '/parts/' + number + '?uploadId=' + encodeURIComponent(uploadId), {
            method:'PUT', headers:{'content-type':'application/octet-stream'}, body:file.slice(offset,end)
          });
          if (!response.ok) throw new Error('multipart part ' + response.status);
          const part = await response.json();
          if (part.partNumber !== number || typeof part.etag !== 'string') throw new Error('multipart part response');
          parts[index] = part;
          uploadedBytes += end - offset;
          onProgress(uploadedBytes, file.size);
        }
      };
      const results = await Promise.allSettled(Array.from({length:Math.min(MAX_PARALLEL_PARTS,count)}, worker));
      const failed = results.find(result => result.status === 'rejected');
      if (failed) throw failed.reason;
      const complete = await fetch(endpoint + '/multipart', {
        method:'POST', headers:{'content-type':'application/json'},
        body:JSON.stringify({action:'complete',uploadId,parts})
      });
      if (!complete.ok) throw new Error('multipart complete ' + complete.status);
      onProgress(file.size, file.size);
    } catch (error) {
      await fetch(endpoint + '/multipart?uploadId=' + encodeURIComponent(uploadId), {method:'DELETE'}).catch(() => {});
      throw error;
    }
  }

  window.BioSatUpload = {send};
})();
