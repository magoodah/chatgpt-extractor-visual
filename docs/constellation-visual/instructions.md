# Prompt for Claude Code: Real-Time Prompt Constellation Clustering Visualization

## Project Overview
Create a single HTML page that displays a beautiful, animated constellation visualization where ChatGPT prompts cluster together based on semantic similarity. Each prompt appears as a glowing node with the user's avatar, and similar prompts naturally gravitate toward each other, forming organic topic clusters in real-time.

## Visual Design Requirements

### Canvas Setup
- Full-screen canvas with dark gradient background (#0a0e27 to #1a365d)
- Subtle particle system in background (optional small dots slowly drifting)
- Canvas should be responsive and fill the viewport
- Use 2D Canvas API for rendering

### Node Design (Individual Prompts)
- Each prompt is represented by a circular node
- Node contains user's profile picture (40x40px circle)
- Glowing border around avatar (color based on cluster)
- Small text preview (first 30 chars) appears on hover
- Nodes have subtle pulsing animation
- New nodes appear with "materialization" effect (scale from 0 to 1 with glow)
- Older nodes gradually fade in opacity (but never below 0.3)

### Clustering Behavior
- Nodes with similar content should attract each other
- Different clusters should have distinct colors (use a palette of 6-8 colors)
- Force-directed graph physics:
  - Attractive force between similar prompts
  - Repulsive force between all nodes (to prevent overlap)
  - Gentle drift toward cluster centers
  - Damping to prevent endless motion

### Cluster Visualization
- Draw subtle glowing regions around groups of related nodes
- Use convex hull or blob-like shapes to encompass cluster members
- Cluster regions should have:
  - Semi-transparent fill (opacity 0.1)
  - Glowing border (opacity 0.3)
  - Color matching the cluster theme
  - Smooth morphing as nodes join/leave

### Visual Effects
- Connection lines between highly similar prompts (opacity based on similarity)
- Ripple effect when new prompt joins a cluster
- Particle trails following moving nodes
- Cluster labels that fade in when cluster reaches 5+ members

## Data Structure

### Fake Prompt Generator
Generate 50-100 fake prompts with the following structure:
```
{
  id: unique identifier,
  content: prompt text (vary between questions, requests, and commands),
  user: {
    name: first name only,
    avatar: use placeholder image service (ui-avatars.com or placekitten.com),
    email: fake email for color generation
  },
  timestamp: staggered over last hour,
  category: hidden field for clustering (choose from: data-analysis, content-creation, coding, planning, research, communication)
}
```

### Prompt Content Examples
Create diverse prompts like:
- "How can I analyze customer churn data..."
- "Write a professional email about..."
- "Create a Python script that..."
- "What are the best practices for..."
- "Generate a quarterly report showing..."
- "Help me understand the concept of..."

## Clustering Algorithm

### Simple Semantic Fingerprinting
1. Extract keywords from each prompt (remove stop words)
2. Calculate similarity using:
   - Keyword overlap
   - Prompt length similarity
   - Question type (how/what/why/when)
   - Presence of technical terms
3. Group prompts with similarity score > 0.6

### Physics Simulation
1. Implement basic force-directed graph:
   - Each node has position (x, y) and velocity (vx, vy)
   - Apply forces each frame:
     - Attraction to similar nodes (inverse square law)
     - Repulsion from all nodes (prevent overlap)
     - Drag coefficient (0.9) to slow movement
     - Boundary collision (bounce off edges)
2. Update positions using Verlet integration
3. Run simulation at 60 FPS using requestAnimationFrame

## Interactive Features

### Mouse Interactions
- Hover over node: Show full prompt preview in tooltip
- Click node: Highlight all similar prompts
- Drag background: Pan the view
- Scroll: Zoom in/out
- Hover over cluster: Show cluster statistics

### UI Overlay
Create a semi-transparent overlay with:
- Title: "Real-Time ChatGPT Prompt Constellation"
- Stats panel (top-right):
  - Total prompts
  - Active clusters
  - Most active category
  - Prompts per minute
- Legend (bottom-left):
  - Cluster colors and names
  - Node age indicator

### Controls (bottom-right)
- Play/Pause animation
- Add random prompt button
- Reset positions button
- Toggle connections on/off

## Animation Timeline

### New Prompt Entry
1. 0ms: Node appears at random edge position (scale: 0, opacity: 0)
2. 0-500ms: Scale to 1.0, opacity to 1.0, bright glow effect
3. 500-1000ms: Move toward cluster center
4. 1000ms+: Settle into position with physics

### Continuous Animations
- Nodes: Gentle breathing effect (scale 0.95-1.05)
- Connections: Pulse opacity (0.1-0.3)
- Clusters: Slow rotation of glow effect
- Background particles: Slow drift across screen

## Performance Optimizations

### Rendering Strategy
1. Use off-screen canvas for static elements
2. Only redraw changed regions
3. Batch similar draw operations
4. Use quadtree for collision detection
5. Limit to 100 visible nodes (fade out oldest)

### Animation Optimizations
1. Use CSS transforms where possible
2. Round positions to prevent sub-pixel rendering
3. Throttle hover effects
4. Use object pooling for particles

## Technical Implementation Details

### Canvas Layer Structure
1. Background layer: Gradient and particles
2. Cluster layer: Glowing regions
3. Connection layer: Lines between nodes
4. Node layer: Avatars and glows
5. UI layer: HTML overlay for controls

### Color Palette
Provide a harmonious color palette with:
- 6-8 distinct cluster colors (blues, purples, greens, oranges)
- Ensure good contrast on dark background
- Use HSL for easy brightness adjustments

### Responsive Design
- Recalculate positions on window resize
- Adjust node sizes for mobile screens
- Ensure touch interactions work properly

## Additional Polish

### Loading State
- Show elegant loading animation while generating initial prompts
- Stagger initial node appearance for visual interest

### Sound Effects (Optional)
- Subtle chime when prompt appears
- Soft whoosh when clusters merge
- Ambient background sound

### Accessibility
- Keyboard navigation between nodes
- Screen reader descriptions for clusters
- High contrast mode option

## Testing Scenarios
1. Start with 20 prompts, add 1 every 2 seconds
2. Test with 100+ nodes for performance
3. Verify clustering works across different categories
4. Ensure smooth animations on various devices

Please implement this as a single, self-contained HTML file with embedded CSS and JavaScript. Use modern ES6+ JavaScript features and CSS3 animations. The result should be visually stunning, performant, and feel magical to watch.