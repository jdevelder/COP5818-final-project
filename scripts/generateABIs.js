const fs = require('fs');
const path = require('path');

/**
 * Script to copy contract ABIs to frontend
 */

const contracts = [
  'TCGCardToken',
  'PriceOracle',
  'FuturesContract',
  'OptionsContract',
  'SwapsContract'
];

const artifactsPath = path.join(__dirname, '..', 'artifacts', 'contracts');
const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'contracts');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

console.log('Generating ABIs for frontend...\n');

contracts.forEach(contractName => {
  try {
    // Read the artifact
    const artifactPath = path.join(artifactsPath, `${contractName}.sol`, `${contractName}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    // Extract ABI
    const abi = artifact.abi;

    // Write ABI to frontend
    const outputFile = path.join(outputPath, `${contractName}.json`);
    fs.writeFileSync(outputFile, JSON.stringify({ abi }, null, 2));

    console.log(`✅ Generated ABI for ${contractName}`);
  } catch (error) {
    console.error(`❌ Error generating ABI for ${contractName}:`, error.message);
  }
});

console.log('\n✨ ABI generation complete!');
