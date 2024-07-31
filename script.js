document.getElementById('cacheForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        document.body.removeChild(scrollTopBtn);
    }
    
    let blockSize = parseInt(document.getElementById('blockSize').value);
    let MMSize = parseInt(document.getElementById('MMSize').value);
    let cacheSize = parseInt(document.getElementById('cacheSize').value);
    let cacheAccessTime = parseInt(document.getElementById('cacheAccessTime').value);
    let memoryAccessTime = parseInt(document.getElementById('memoryAccessTime').value);
    let programFlow = document.getElementById('programFlow').value.split(',');

    let skip = document.getElementById('skip').checked;
    let delay
    if (skip){
       delay = 0;
    }else{
        delay=1000;}
    let unitMM = document.getElementById('MMSizeUnit').value;
    let unitCache = document.getElementById('cacheSizeUnit').value;
    let unitSeq = document.getElementById('programFlowUnit').value;

    let missPenalty = cacheAccessTime * 2 + memoryAccessTime * blockSize;
    if (unitMM == 'word') {
        MMSize = Math.ceil(MMSize / blockSize);
    }

    if (unitCache == 'word') {
        cacheSize = Math.ceil(cacheSize / blockSize);
    }

    if (unitSeq == 'word') {
        programFlow = programFlow.map(addr => parseInt(addr, 16));
        cacheSize = cacheSize * 4
    } else {
        programFlow = programFlow.map(Number);
    }
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
                    <th>${unitSeq == 'block' ? 'Block' : 'Tag'}</th>
                </tr>
            </thead>
            <tbody id="traceTableBody">
            </tbody>
        </table>
    `;

    function renderCacheTable() {
        let cacheTable = document.getElementById('cacheTable');
        if(unitSeq == 'block'){
            cacheTable.innerHTML =`
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
            `;}}
        else{
            cacheTable.innerHTML =`
            <tr>
            <th>Valid bit</th>
            <th>Tag</th>
            <th>Data</th>
            </tr>`;
            for (let i = 0; i < blocks.length/4; i++) {
                cacheTable.innerHTML += `
                    <tr>
                        <td>${blocks[i*4+3] !== null ? '1':'0'}</td>
                        <td>${i}</td>
                        <td>${blocks[i*4] !== null ? '0x' + blocks[i*4].toString(16).padStart(2,'0').toUpperCase() : ' '}</td>
                        `;
            for (let j = 1; j < 4; j++) {
                cacheTable.innerHTML += `
                        <td style="padding:20px;"></td>
                        <td></td>
                        <td>${blocks[i*4+j] !== null ? '0x' + blocks[i*4+j].toString(16).padStart(2,'0').toUpperCase() : ' '}</td>
                `;}
            }
        }
    }

    function renderTraceTable(seq, hit, block) {
        let traceTableBody = document.getElementById('traceTableBody');
        traceTableBody.innerHTML += `
            <tr style="background-color: ${hit ? 'lightgreen' : 'lightcoral'}">
                <td>${unitSeq == 'word' ? '0x'+ seq.toString(16).padStart(2,'0').toUpperCase() : seq}</td>
                <td>${hit ? 'Hit' : ''}</td>
                <td>${hit ? '' : 'Miss'}</td>
                <td>${unitSeq == 'block'? block: Math.floor(block/4)}</td>
            </tr>
        `;
    }

    function renderHistoryTable(iteration) {
        let historyDiv = document.getElementById('history');
        let historyTable = `<p>Iteration ${iteration + 1}</p><table border="1"><tr>
        ${unitSeq == 'block' ? '<th>Block</th><th>Data</th>' : '<th>Valid Bit</th><th>Tag</th><th>Data</th>'}
        </tr>`;
    
        for (let j = 0; j < cacheHistory[iteration].length; j++) {
            historyTable += '<tr>';
            if (unitSeq == 'block') {
                historyTable += `<td>${j}</td>
                    <td>${cacheHistory[iteration][j] !== null ? cacheHistory[iteration][j] : ' '}</td></tr>`;
            } else {
                historyTable += `
                    <td>${cacheHistory[iteration][Math.floor(j / 4) * 4 + 3] !== null ? '1' : '0'}</td>
                    <td>${Math.floor(j / 4)}</td>
                    <td>${cacheHistory[iteration][j] !== null ? '0x' + cacheHistory[iteration][j].toString(16).padStart(2, '0').toUpperCase() : ' '}</td></tr>`;
            }
        }
        historyTable += '</table>';
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
${unitSeq == 'block' ? 
    `Block\tData\n${blocks.map((data, index) => `${index}\t${data !== null ? data : ' '}`).join('\n')}` : 
    `Valid Bit\tTag\tData\n${blocks.map((data, index) => `${data !== null ? '1' : '0'}\t\t${Math.floor(index / 4)}\t${data !== null ? '0x' + data.toString(16).padStart(2, '0').toUpperCase() : ' '}`).join('\n')}`
}

Cache Memory Trace:
Sequence\tHit?\tMiss?\t${unitSeq == 'block' ? 'Block' : 'Tag'}
${cacheTrace.map(step => `${unitSeq == 'word' ? '0x' + step.seq.toString(16).padStart(2, '0').toUpperCase() : step.seq}\t\t${step.hit ? 'Hit' : ''}\t${step.hit ? '' : 'Miss'}\t${step.block}`).join('\n')}

Cache Memory History:
${cacheHistory.map((cache, iteration) => `Iteration ${iteration + 1}\n${unitSeq == 'block' ? 'Block\tData' : 'Valid Bit\tTag\tData'}\n${cache.map((data, index) => `${unitSeq == 'word' ? `${cache[Math.floor(index / 4) * 4 + 3] !== null ? '1\t\t' : '0\t\t'}`:''}${unitSeq == 'block' ? index : Math.floor(index / 4)}\t${unitSeq == 'block' ? data !== null ? data : ' ' : data !== null ? '0x' + data.toString(16).padStart(2, '0').toUpperCase() : ' '}`).join('\n')}`).join('\n\n')}
`;
                let blob = new Blob([resultText.trim()], { type: 'text/plain' });
                let link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'cache_results.txt';
                link.click();
            };

            // Add "Scroll to the Top" button
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
        }, delay);  // Adjust the interval as needed
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
