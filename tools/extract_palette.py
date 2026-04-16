from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class PaletteOptions:
    width: int = 360
    alpha_min: int = 250
    quant_step: int = 8
    top_n_all: int = 30
    top_n_each: int = 14


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    r, g, b = rgb
    return f"#{r:02X}{g:02X}{b:02X}"


def quantize(rgb: tuple[int, int, int], step: int) -> tuple[int, int, int]:
    return tuple((c // step) * step for c in rgb)  # type: ignore[return-value]


def extract_counts(img: Image.Image, opt: PaletteOptions) -> Counter[tuple[int, int, int]]:
    img = img.convert("RGBA")
    w = opt.width
    h = max(1, int(img.height * w / img.width))
    img = img.resize((w, h))

    counts: Counter[tuple[int, int, int]] = Counter()
    for r, g, b, a in img.getdata():
        if a < opt.alpha_min:
            continue
        # ignore near-black mockup bezel
        if r < 16 and g < 16 and b < 16:
            continue
        q = quantize((r, g, b), opt.quant_step)
        counts[q] += 1
    return counts


def main() -> None:
    opt = PaletteOptions()

    # Put your reference images here (absolute paths).
    paths = [
        r"C:\Users\hf_12\.cursor\projects\d-yiya-Childs-Healthy-App-main-new\assets\c__Users_hf_12_AppData_Roaming_Cursor_User_workspaceStorage_1b9607b2188380998e916d324eea37cc_images_image-829baa2f-4582-46da-a3ce-2b07806b42aa.png",
        r"C:\Users\hf_12\.cursor\projects\d-yiya-Childs-Healthy-App-main-new\assets\c__Users_hf_12_AppData_Roaming_Cursor_User_workspaceStorage_1b9607b2188380998e916d324eea37cc_images_image-5ff339fd-604f-4d1a-b424-9a92545b3a2c.png",
        r"C:\Users\hf_12\.cursor\projects\d-yiya-Childs-Healthy-App-main-new\assets\c__Users_hf_12_AppData_Roaming_Cursor_User_workspaceStorage_1b9607b2188380998e916d324eea37cc_images_image-842be78f-6f2a-41bb-9281-5524a955c114.png",
        r"C:\Users\hf_12\.cursor\projects\d-yiya-Childs-Healthy-App-main-new\assets\c__Users_hf_12_AppData_Roaming_Cursor_User_workspaceStorage_1b9607b2188380998e916d324eea37cc_images_image-0c52c9a6-8481-4711-b930-daa9a007b198.png",
        r"C:\Users\hf_12\.cursor\projects\d-yiya-Childs-Healthy-App-main-new\assets\c__Users_hf_12_AppData_Roaming_Cursor_User_workspaceStorage_1b9607b2188380998e916d324eea37cc_images_image-2eacbfd2-d029-41b8-91f4-9dc878e907da.png",
        r"C:\Users\hf_12\.cursor\projects\d-yiya-Childs-Healthy-App-main-new\assets\c__Users_hf_12_AppData_Roaming_Cursor_User_workspaceStorage_1b9607b2188380998e916d324eea37cc_images_image-b917efb0-b07d-44cb-9a0a-2fef80cebf93.png",
    ]

    all_counts: Counter[tuple[int, int, int]] = Counter()
    per_image: dict[str, Counter[tuple[int, int, int]]] = {}

    for p in paths:
        img = Image.open(p)
        c = extract_counts(img, opt)
        name = Path(p).name
        per_image[name] = c
        all_counts.update(c)

    print("=== TOP COLORS (ALL IMAGES, quantized) ===")
    for rgb, n in all_counts.most_common(opt.top_n_all):
        print(f"{rgb_to_hex(rgb)}\t{rgb}\t{n}")

    print("\n=== TOP COLORS PER IMAGE ===")
    for name, c in per_image.items():
        print(f"\n-- {name} --")
        for rgb, n in c.most_common(opt.top_n_each):
            print(f"{rgb_to_hex(rgb)}\t{rgb}\t{n}")


if __name__ == "__main__":
    main()

