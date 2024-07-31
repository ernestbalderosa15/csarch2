# CSARCH GROUP 7 S11 | Cache simulator (Full associative / MRU)
## Simulation Project

The application will simulate a most recently used (MRU) replacement algorithm in a full associative cache memory. The application will mimic the cache memmory and operations based on the given values by the user. The user will see the results and be able to download a text file of the result. 

### User Input
  - Block Size (words)
  - Main Memory Size (blocks/words)
  - Cache Memory Size (blocks/words)
  - Cache Access Time (ns)
  - Memory Access Time (ns)
  - Program Flow (blocks/words) ; input values are separated by comma, blocks are in decimal, words are in hex

### Output
  - Number of cache hits and misses
  - Miss penalty
  - Average memory access time
  - Total memory access time
  - Snapshot of the cache memory
  - Detailed cache memory history and trace

## User's Manual
  1. Go to the deployed website (https://csarch2-ernest-balderosas-projects.vercel.app/)
  2. Enter appropriate values for each input
      - Block Size (words)
             - sample input : 128 words
      - Main Memory Size 
           - pick what unit you'll be using (blocks/words)
             - sample input : 16 blocks, 2048 words
      - Cache Memory Size (blocks/words)
           - pick what unit you'll be using (blocks/words)
             - sample input : 4 blocks, 512 words
      - Cache Access Time (ns)
             - sample input : 1ns
      - Memory Access Time (ns)
             - sample input : 10ns
      - Program Flow (blocks/words) 
           - pick what unit you'll be using (blocks/words)
             - sample input :
               - word unit : 01,AA,0x00,1,F,F0    (if wrong input the app will read NaN)
               - block unit : 1,7,5,0,2,1,5,6,5,2,2,0    (if wrong input the app will read NaN)
  3. There is an animation feature, you can skip this by clicking the checkbox with label "skip animation", above the "Simulate" button
  4. After you fill-up all input, you can press "Simulate" Button then will be presented by the result and below the "Simulate" Button you can click the "Download Cache History" Button to download the results

## Application Screenshots
### - Website appearance:
![image](https://github.com/user-attachments/assets/702f0641-8b98-4fc5-b0ad-873126ceb817)

### - Sample of result from correct input(block)
![image](https://github.com/user-attachments/assets/35e66262-d2fc-4097-a040-055454974d3c)
![image](https://github.com/user-attachments/assets/8c4ddae3-633a-4bb7-b4f1-52a16a944469)

### - Sample of result from correct input(word)
![image](https://github.com/user-attachments/assets/cc47e48f-0dd9-48da-a0d7-e1b5a907b1ad)

### - Sample of downloaded result (.txt file)
![image](https://github.com/user-attachments/assets/46301a56-8606-475f-aa14-ba20ec24945a)

### - Sample of result from wrong input (Hex values in block unit program flow)
![image](https://github.com/user-attachments/assets/0ff44c28-d497-4ea4-96dd-c222639bb237)
