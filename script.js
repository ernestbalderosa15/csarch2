document.getElementById('cacheForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let blockSize = parseInt(document.getElementById('blockSize').value);
    let MMSize = parseInt(document.getElementById('MMSize').value);
    let cacheSize = parseInt(document.getElementById('cacheSize').value);
    let cacheAccessTime = parseInt(document.getElementById('cacheAccessTime').value);
    let memoryAccessTime = parseInt(document.getElementById('memoryAccessTime').value);
    let programFlow = document.getElementById('programFlow').value.split(',').map(Number);

    let missPenalty = cacheAccessTime * 2 + memoryAccessTime * blockSize;

    let cacheHit = 0;
    let cacheMiss = 0;
    let blocks = new Array(cacheSize).fill(null);
    let mruIndex = new Array(cacheSize).fill(-1); // To store MRU indices
    let cacheHistory = [];

    programFlow.forEach((elem, i) => {
        if (blocks.includes(elem)) {
            cacheHit += 1;
            let idx = blocks.indexOf(elem);
            mruIndex = updateMRU(mruIndex, idx);
        } else {
            cacheMiss += 1;
            let replaceIdx = mruIndex.indexOf(-1) !== -1 ? mruIndex.indexOf(-1) : mruIndex[cacheSize - 1];
            blocks[replaceIdx] = elem;
            mruIndex = updateMRU(mruIndex, replaceIdx);
        }
        cacheHistory.push([...blocks]);
    });

    function updateMRU(mruIndex, idx) {
        mruIndex = mruIndex.filter(i => i !== idx);
        mruIndex.unshift(idx);
        return mruIndex;
    }

    function calcAveAT() {
        let hitRate = cacheHit / programFlow.length;
        let averageAccess = hitRate * cacheAccessTime + (1 - hitRate) * missPenalty;
        return averageAccess.toFixed(2);
    }

    let averageAccessTime = calcAveAT();

    function totalAccessTime() {
        let AccessTime = cacheHit * cacheAccessTime + cacheMiss * missPenalty;
        return AccessTime.toFixed(2);
    }

    let tAccessTime = totalAccessTime();

    let output = `
        <p>Number of cache hits: ${cacheHit}/${programFlow.length}</p>
        <p>Number of cache misses: ${cacheMiss}/${programFlow.length}</p>
        <p>Miss penalty: ${missPenalty}ns</p>
        <p>Average memory access time: ${averageAccessTime}ns</p>
        <p>Total memory access time: ${tAccessTime}ns</p>
        <h3>Cache Memory History:</h3>
        <pre>${JSON.stringify(cacheHistory, null, 2)}</pre>
    `;

    document.getElementById('output').innerHTML = output;
    document.getElementById('downloadBtn').style.display = 'block';

    document.getElementById('downloadBtn').onclick = function() {
        let resultText = `
Number of cache hits: ${cacheHit}/${programFlow.length}
Number of cache misses: ${cacheMiss}/${programFlow.length}
Miss penalty: ${missPenalty}ns
Average memory access time: ${averageAccessTime}ns
Total memory access time: ${tAccessTime}ns
Cache Memory History:
${cacheHistory.map((step, index) => `Iteration ${index + 1}: ${step.filter(block => block !== null).join(', ')}`).join('\n')}
        `;
        let blob = new Blob([resultText.trim()], { type: 'text/plain' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cache_results.txt';
        link.click();
    };
});
