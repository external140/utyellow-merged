#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Merges game.unx.part* files into a single game.unx file
 */
async function mergeGameFiles() {
    const outputPath = path.join(__dirname, 'game.unx');
    const writeStream = fs.createWriteStream(outputPath);
    
    let partNumber = 1;
    let filesMerged = 0;
    
    return new Promise((resolve, reject) => {
        function mergeNextPart() {
            const partPath = path.join(__dirname, `game.unx.part${partNumber}`);
            
            if (!fs.existsSync(partPath)) {
                // No more parts found
                writeStream.end();
                console.log(`✓ Successfully merged ${filesMerged} files into game.unx`);
                resolve();
                return;
            }
            
            console.log(`Merging part ${partNumber}...`);
            const readStream = fs.createReadStream(partPath);
            
            readStream.pipe(writeStream, { end: false });
            
            readStream.on('end', () => {
                filesMerged++;
                partNumber++;
                mergeNextPart();
            });
            
            readStream.on('error', (err) => {
                writeStream.destroy();
                reject(err);
            });
        }
        
        writeStream.on('error', reject);
        mergeNextPart();
    });
}

// Run the merge
mergeGameFiles()
    .then(() => {
        console.log('✓ File merge complete!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('✗ Error merging files:', err);
        process.exit(1);
    });
