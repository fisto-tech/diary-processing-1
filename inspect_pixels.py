from PIL import Image

img = Image.open("assets/images/milk-bottle-green.png")
width, height = img.size
mid_y = height // 2

# Inspect 20 pixels from the left edge towards the center
for x in range(0, 100, 5):
    print(f"Pixel at ({x}, {mid_y}): {img.getpixel((x, mid_y))}")
