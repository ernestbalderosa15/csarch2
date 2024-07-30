document.getElementById('cacheForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let blockSize = parseInt(document.getElementById('blockSize').value);
    let MMSize = parseInt(document.getElementById('MMSize').value);
    let cacheSize = parseInt(document.getElementById('cacheSize').value);
    let cacheAccessTime = parseInt(document.getElementById('cacheAccessTime').value);
    let memoryAccessTime = parseInt(document.getElementById('memoryAccessTime').value);
    let programFlow = document.getElementById('programFlow').value.split(',').map(Number);

    let missPenalty = cacheAccessTime * 2 + memoryAccessTime * blockSize;
    // if MMSize is in words
    // MMSize = MMSize/blockSize
    // if cacheSize is in words
    // cacheSize = cacheSize/blockSize
    // if programFlow is in words
    // check if in binary
    // turn cacheSize into words
    let word = Math.log2(blockSize);
    let tag = Math.log2(MMSize) - word;
    let cacheHit = 0;
    let cacheMiss = 0;
    let currIdx = 0;
    let blocks = new Array(cacheSize).fill(null);
    let cacheHistory = [];
    let cacheTrace = [];

    programFlow.forEach(elem => {
        let hit = false;
        if (blocks.includes(elem)) {
            cacheHit += 1;
            currIdx = blocks.indexOf(elem);
            hit = true;
        } else {
            cacheMiss += 1;
            if (blocks.includes(null)) {
                currIdx = blocks.indexOf(null);
            }
            blocks[currIdx] = elem;
        }
        cacheHistory.push([...blocks]);
        cacheTrace.push({
            seq: elem,
            hit: hit,
            block: currIdx
        });
    });

    function calcAveAT() {
        let hitRate = cacheHit / programFlow.length;
        let averageAccess = hitRate * cacheAccessTime + (1 - hitRate) * missPenalty;
        return averageAccess.toFixed(2);
    }

    let averageAccessTime = calcAveAT();

    function totalAccessTime() {
        let accessTime = cacheHit * blockSize * cacheAccessTime + cacheMiss * (cacheAccessTime + blockSize * (cacheAccessTime + memoryAccessTime));
        return accessTime.toFixed(2);
    }

    let tAccessTime = totalAccessTime();

    let output = `
        <p>Number of cache hits: ${cacheHit}/${programFlow.length}</p>
        <p>Number of cache misses: ${cacheMiss}/${programFlow.length}</p>
        <p>Miss penalty: ${missPenalty}ns</p>
        <p>Average memory access time: ${averageAccessTime}ns</p>
        <p>Total memory access time: ${tAccessTime}ns</p>
        <h3>Snapshot of the cache memory:</h3>
        <table border="1">
            <tr>
                <th>Block</th>
                <th>Data</th>
            </tr>
    `;
    for (let i = 0; i < blocks.length; i++) {
        output += `
            <tr>
                <td>${i}</td>
                <td>${blocks[i] !== null ? blocks[i] : ' '}</td>
            </tr>
        `;
    }
    output += `</table>`;

    let trace_output = `
        <h3>Cache Memory Trace:</h3>
        <table border="1">
            <thead>
                <tr>
                    <th>Sequence</th>
                    <th>Hit</th>
                    <th>Miss</th>
                    <th>Block</th>
                </tr>
            </thead>
            <tbody>
                ${cacheTrace.map(step => `
                    <tr>
                        <td>${step.seq}</td>
                        <td>${step.hit ? 'Hit' : ''}</td>
                        <td>${step.hit ? '' : 'Miss'}</td>
                        <td>${step.block}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    let history_output = `<h3>Cache Memory History:</h3>`;
    for (let i = 0; i < cacheHistory.length; i++) {
        history_output += `
            <p>Iteration ${i + 1}</p>
            <table border="1">
                <tr>
                    <th>Block</th>
                    <th>Data</th>
                </tr>
        `;
        for (let j = 0; j < cacheHistory[i].length; j++) {
            history_output += `
                <tr>
                    <td>${j}</td>
                    <td>${cacheHistory[i][j] !== null ? cacheHistory[i][j] : ' '}</td>
                </tr>
            `;
        }
        history_output += `</table>`;
    }

    document.getElementById('output').innerHTML = output;
    document.getElementById('history').innerHTML = history_output;
    document.getElementById('trace').innerHTML = trace_output;

    document.getElementById('downloadBtn').style.display = 'block';

    document.getElementById('downloadBtn').onclick = function() {
        let resultText = `
Number of cache hits: ${cacheHit}/${programFlow.length}
Number of cache misses: ${cacheMiss}/${programFlow.length}
Miss penalty: ${missPenalty}ns
Average memory access time: ${averageAccessTime}ns
Total memory access time: ${tAccessTime}ns
Cache Memory Snapshot:
Block\tData
${blocks.map((data, index) => `${index}\t${data !== null ? data : ' '}`).join('\n')}
        `;
        let blob = new Blob([resultText.trim()], { type: 'text/plain' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cache_results.txt';
        link.click();
    };
});

document.getElementById('clearBtn').addEventListener('click', function() {
    document.getElementById('cacheForm').reset();
    document.getElementById('output').innerHTML = '';
    document.getElementById('downloadBtn').style.display = 'none';
});
