document.getElementById('cacheForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let blockSize = parseInt(document.getElementById('blockSize').value);
    let MMSize = parseInt(document.getElementById('MMSize').value);
    let cacheSize = parseInt(document.getElementById('cacheSize').value);
    let cacheAccessTime = parseInt(document.getElementById('cacheAccessTime').value);
    let memoryAccessTime = parseInt(document.getElementById('memoryAccessTime').value);
    let programFlow = document.getElementById('programFlow').value.split(',').map(Number);

    let missPenalty = cacheAccessTime * 2 + memoryAccessTime * blockSize;
    let word = Math.log2(blockSize);
    let tag = Math.log2(MMSize) - word;
    let cacheHit = 0;
    let cacheMiss = 0;
    let currIdx = 0;
    let blocks = new Array(cacheSize).fill(null);
    let cacheHistory = [];
    let cacheTrace = [];

    document.getElementById('output').innerHTML = `
        <p>Number of cache hits: ${cacheHit}/${programFlow.length}</p>
        <p>Number of cache misses: ${cacheMiss}/${programFlow.length}</p>
        <p>Miss penalty: ${missPenalty}ns</p>
        <p>Average memory access time: 0ns</p>
        <p>Total memory access time: 0ns</p>
        <h3>Snapshot of the cache memory:</h3>
        <table border="1" id="cacheTable">
            <tr>
                <th>Block</th>
                <th>Data</th>
            </tr>
        </table>
    `;

    document.getElementById('history').innerHTML = `<h3>Cache Memory History:</h3>`;
    document.getElementById('trace').innerHTML = `
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
            <tbody id="traceTableBody">
            </tbody>
        </table>
    `;

    function renderCacheTable() {
        let cacheTable = document.getElementById('cacheTable');
        cacheTable.innerHTML = `
            <tr>
                <th>Block</th>
                <th>Data</th>
            </tr>
        `;
        for (let i = 0; i < blocks.length; i++) {
            cacheTable.innerHTML += `
                <tr>
                    <td>${i}</td>
                    <td>${blocks[i] !== null ? blocks[i] : ' '}</td>
                </tr>
            `;
        }
    }

    function renderTraceTable(seq, hit, block) {
        let traceTableBody = document.getElementById('traceTableBody');
        traceTableBody.innerHTML += `
            <tr style="background-color: ${hit ? 'lightgreen' : 'lightcoral'}">
                <td>${seq}</td>
                <td>${hit ? 'Hit' : ''}</td>
                <td>${hit ? '' : 'Miss'}</td>
                <td>${block}</td>
            </tr>
        `;
    }

    function renderHistoryTable(iteration) {
        let historyDiv = document.getElementById('history');
        let historyTable = `<p>Iteration ${iteration + 1}</p><table border="1"><tr><th>Block</th><th>Data</th></tr>`;
        for (let j = 0; j < cacheHistory[iteration].length; j++) {
            historyTable += `
                <tr>
                    <td>${j}</td>
                    <td>${cacheHistory[iteration][j] !== null ? cacheHistory[iteration][j] : ' '}</td>
                </tr>
            `;
        }
        historyTable += `</table>`;
        historyDiv.innerHTML += historyTable;
    }

    function calcAveAT() {
        let hitRate = cacheHit / programFlow.length;
        let averageAccess = hitRate * cacheAccessTime + (1 - hitRate) * missPenalty;
        return averageAccess.toFixed(2);
    }

    function totalAccessTime() {
        let accessTime = cacheHit * blockSize * cacheAccessTime + cacheMiss * (cacheAccessTime + blockSize * (cacheAccessTime + memoryAccessTime));
        return accessTime.toFixed(2);
    }

    function updateStats() {
        let averageAccessTime = calcAveAT();
        let tAccessTime = totalAccessTime();
        document.getElementById('output').innerHTML = `
            <p>Number of cache hits: ${cacheHit}/${programFlow.length}</p>
            <p>Number of cache misses: ${cacheMiss}/${programFlow.length}</p>
            <p>Miss penalty: ${missPenalty}ns</p>
            <p>Average memory access time: ${averageAccessTime}ns</p>
            <p>Total memory access time: ${tAccessTime}ns</p>
            <h3>Snapshot of the cache memory:</h3>
            <table border="1" id="cacheTable">
                <tr>
                    <th>Block</th>
                    <th>Data</th>
                </tr>
            </table>
        `;
        renderCacheTable();
    }

    function simulateStep(index) {
        if (index >= programFlow.length) {
            document.getElementById('downloadBtn').style.display = 'block';
            document.getElementById('downloadBtn').onclick = function() {
                let resultText = `
Number of cache hits: ${cacheHit}/${programFlow.length}
Number of cache misses: ${cacheMiss}/${programFlow.length}
Miss penalty: ${missPenalty}ns
Average memory access time: ${calcAveAT()}ns
Total memory access time: ${totalAccessTime()}ns

Cache Memory Snapshot:
Block\tData
${blocks.map((data, index) => `${index}\t${data !== null ? data : ' '}`).join('\n')}

Cache Memory Trace:
Sequence\tHit\tMiss\tBlock
${cacheTrace.map(step => `${step.seq}\t${step.hit ? 'Hit' : ''}\t${step.hit ? '' : 'Miss'}\t${step.block}`).join('\n')}

Cache Memory History:
${cacheHistory.map((snapshot, iteration) => `Iteration ${iteration + 1}\nBlock\tData\n${snapshot.map((data, index) => `${index}\t${data !== null ? data : ' '}`).join('\n')}`).join('\n\n')}
                `;
                let blob = new Blob([resultText.trim()], { type: 'text/plain' });
                let link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'cache_results.txt';
                link.click();
            };

            // Add "Scroll to the Top" button
            let existingScrollTopBtn = document.getElementById('scrollTopBtn');
            if (!existingScrollTopBtn) {
                let scrollTopBtn = document.createElement('button');
                scrollTopBtn.textContent = 'Scroll to the Top';
                scrollTopBtn.onclick = function() {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
                scrollTopBtn.id = 'scrollTopBtn';  // Added ID for easy removal
                document.body.appendChild(scrollTopBtn);
                scrollTopBtn.style.display = 'block';
                scrollTopBtn.style.margin = '20px auto';
                scrollTopBtn.style.padding = '10px 20px';
                scrollTopBtn.style.fontSize = '16px';
                scrollTopBtn.style.cursor = 'pointer';
            }

            return;
        }

        let elem = programFlow[index];
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

        renderTraceTable(elem, hit, currIdx);
        renderHistoryTable(index);
        updateStats();

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        
        setTimeout(() => {
            simulateStep(index + 1);
        }, 1000);  // Adjust the interval as needed
    }

    simulateStep(0);
});

document.getElementById('clearBtn').addEventListener('click', function() {
    document.getElementById('cacheForm').reset();
    document.getElementById('output').innerHTML = '';
    document.getElementById('history').innerHTML = '';
    document.getElementById('trace').innerHTML = '';
    document.getElementById('downloadBtn').style.display = 'none';

    // Remove "Scroll to the Top" button if it exists
    let scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        document.body.removeChild(scrollTopBtn);
    }
});
