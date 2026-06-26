import os
from PIL import Image

def remove_background(image_path, threshold=235):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist.")
        return
        
    print(f"Processing {image_path}...")
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    data = img.load()
    
    # Let's inspect the corner color
    corner_color = data[0, 0]
    print(f"Corner pixel color at (0,0): {corner_color}")
    
    # BFS to flood fill from corners
    queue = []
    visited = set()
    
    # Add all edge pixels as starting points to handle cropped/offset borders
    edges = []
    for x in range(width):
        edges.append((x, 0))
        edges.append((x, height - 1))
    for y in range(1, height - 1):
        edges.append((0, y))
        edges.append((width - 1, y))
        
    for x, y in edges:
        queue.append((x, y))
        visited.add((x, y))
        
    while queue:
        x, y = queue.pop(0)
        r, g, b, a = data[x, y]
        
        # If it's near-white (background), clear it and propagate
        if r > threshold and g > threshold and b > threshold:
            data[x, y] = (r, g, b, 0)
            
            # Check 4-connected neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    # Soften the edges by performing a simple 1px alpha blur/feather on the boundary
    # to avoid jagged edges on the glass outline.
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            r, g, b, a = data[x, y]
            if a > 0:
                # Count transparent neighbors
                trans_neighbors = 0
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    if data[x + dx, y + dy][3] == 0:
                        trans_neighbors += 1
                if trans_neighbors > 0:
                    # Soften edge pixel alpha
                    data[x, y] = (r, g, b, int(a * 0.4))

    img.save(image_path, "PNG")
    print(f"Saved {image_path} successfully!")

# Run for all three bottles
remove_background("assets/images/milk-bottle-blue.png")
remove_background("assets/images/milk-bottle-green.png")
remove_background("assets/images/milk-bottle-pink.png")
