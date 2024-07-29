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
    let currIdx = 0;
    let blocks = new Array(cacheSize).fill(null);
    let cacheHistory = [];

    programFlow.forEach(elem => {
        if (blocks.includes(elem)) {
            cacheHit += 1;
            currIdx = blocks.indexOf(elem);
        } else { // if miss
            cacheMiss += 1;
            if (blocks.includes(null)) { //check other spaces, replace null
                currIdx = blocks.indexOf(null);
            }
            blocks[currIdx] = elem; //if no null, change most recently used block 
        }
        cacheHistory.push([...blocks]);
    });

    function calcAveAT() {
        let hitRate = cacheHit / programFlow.length;
        let averageAccess = hitRate * cacheAccessTime + (1 - hitRate) * missPenalty;
        return averageAccess.toFixed(2);
    }

    let averageAccessTime = calcAveAT();

    function totalAccessTime(){
        let AccessTime = cacheHit * blockSize * cacheAccessTime + cacheMiss *(cacheAccessTime + blockSize * (cacheAccessTime + memoryAccessTime));
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
        let historyText = cacheHistory.map((step, index) => `Iteration ${index + 1}: ${step.join(', ')}`).join('\n');
        let blob = new Blob([historyText], { type: 'text/plain' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cache_history.txt';
        link.click();
    };
});