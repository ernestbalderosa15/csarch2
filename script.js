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
        let hitOrMiss;
        if (blocks.includes(elem)) {
            cacheHit += 1;
            currIdx = blocks.indexOf(elem);
            hitOrMiss = 'Hit';
        } else {
            cacheMiss += 1;
            if (blocks.includes(null)) {
                currIdx = blocks.indexOf(null);
            }
            blocks[currIdx] = elem;
            hitOrMiss = 'Miss';
        }
        cacheHistory.push({seq: elem, hit: hitOrMiss === 'Hit' ? elem : '', miss: hitOrMiss === 'Miss' ? elem : '', block: hitOrMiss === 'Miss' ? currIdx : ''});
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
        <table>
            <thead>
                <tr>
                    <th>Sequence</th>
                    <th>Hit</th>
                    <th>Miss</th>
                    <th>Block</th>
                </tr>
            </thead>
            <tbody>
                ${cacheHistory.map(step => `
                    <tr>
                        <td>${step.seq}</td>
                        <td>${step.hit}</td>
                        <td>${step.miss}</td>
                        <td>${step.block}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
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
Seq\tHit\tMiss\tBlock
${cacheHistory.map(step => `${step.seq}\t${step.hit}\t${step.miss}\t${step.block}`).join('\n')}
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
