// Debug script to analyze clustering issues
// Run this in browser console after constellation.html loads

function debugClustering() {
    const app = window.constellation;
    const nodes = app.physicsEngine.nodes;
    const clusterManager = app.physicsEngine.clusterManager;
    
    console.log(`=== CLUSTER DEBUG ANALYSIS ===`);
    console.log(`Total nodes: ${nodes.length}`);
    
    if (nodes.length < 2) {
        console.log('❌ Not enough nodes for clustering analysis');
        return;
    }
    
    // Test similarity between first few nodes
    console.log(`\n--- SIMILARITY ANALYSIS ---`);
    for (let i = 0; i < Math.min(5, nodes.length); i++) {
        for (let j = i + 1; j < Math.min(5, nodes.length); j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];
            const similarity = clusterManager.calculateSimilarity(node1, node2);
            
            console.log(`Node ${i} vs Node ${j}: ${similarity.toFixed(3)}`);
            console.log(`  - Node ${i}: "${node1.prompt.content.substring(0, 60)}..."`);
            console.log(`  - Node ${j}: "${node2.prompt.content.substring(0, 60)}..."`);
            console.log(`  - Keywords ${i}: [${node1.keywords.slice(0, 5).join(', ')}]`);
            console.log(`  - Keywords ${j}: [${node2.keywords.slice(0, 5).join(', ')}]`);
            console.log(`  - Categories: ${node1.prompt.category} vs ${node2.prompt.category}`);
            console.log(`  - Threshold needed: 0.4, Actual: ${similarity.toFixed(3)} ${similarity >= 0.4 ? '✅' : '❌'}`);
            console.log('');
        }
    }
    
    // Check categories distribution
    console.log(`--- CATEGORY DISTRIBUTION ---`);
    const categories = {};
    nodes.forEach(node => {
        categories[node.prompt.category] = (categories[node.prompt.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([cat, count]) => {
        console.log(`${cat}: ${count} nodes`);
    });
    
    // Find highest similarity
    let maxSimilarity = 0;
    let bestPair = null;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const sim = clusterManager.calculateSimilarity(nodes[i], nodes[j]);
            if (sim > maxSimilarity) {
                maxSimilarity = sim;
                bestPair = [i, j];
            }
        }
    }
    
    console.log(`\n--- BEST SIMILARITY FOUND ---`);
    console.log(`Highest similarity: ${maxSimilarity.toFixed(3)} between nodes ${bestPair[0]} and ${bestPair[1]}`);
    console.log(`Threshold: 0.4 - ${maxSimilarity >= 0.4 ? '✅ WOULD CLUSTER' : '❌ TOO LOW'}`);
    
    return {
        nodeCount: nodes.length,
        categories: categories,
        maxSimilarity: maxSimilarity,
        bestPair: bestPair,
        wouldCluster: maxSimilarity >= 0.4
    };
}

// Run the analysis
debugClustering();