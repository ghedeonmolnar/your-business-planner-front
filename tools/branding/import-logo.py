import argparse
import hashlib
from pathlib import Path
import struct
import subprocess

PNG_SIGNATURE = b'\x89PNG\r\n\x1a\n'


def read_png(filename):
    source = Path(filename).read_bytes()
    if len(source) < 33 or source[:8] != PNG_SIGNATURE or source[12:16] != b'IHDR':
        raise ValueError('BRAND_PNG_INVALID')
    width, height = struct.unpack('>II', source[16:24])
    if width == 0 or height == 0:
        raise ValueError('BRAND_PNG_DIMENSIONS_INVALID')
    return source, width, height


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('--icon', required=True)
    parser.add_argument('--resvg-module', required=True)
    options = parser.parse_args()
    repository = Path(__file__).resolve().parents[2]
    source, logo_width, logo_height = read_png(options.source)
    icon, icon_width, icon_height = read_png(options.icon)
    if logo_width != logo_height * 3:
        raise ValueError('LOGO_ASPECT_RATIO_3_TO_1_REQUIRED')
    if icon_width != icon_height or icon_width < 1024:
        raise ValueError('ICON_SQUARE_MINIMUM_1024_REQUIRED')
    asset = repository / 'assets/brand/ybp-logo.png'
    asset.parent.mkdir(parents=True, exist_ok=True)
    asset.write_bytes(source)
    icon_asset = repository / 'assets/app-icon/ybp-icon-source.png'
    icon_asset.parent.mkdir(parents=True, exist_ok=True)
    icon_asset.write_bytes(icon)
    subprocess.run(
        ['node', str(repository / 'tools/branding/render-logo.cjs'), options.resvg_module],
        cwd=repository,
        check=True,
    )
    print('Logo importat, SHA256 ' + hashlib.sha256(source).hexdigest())
    print('Icon importat, SHA256 ' + hashlib.sha256(icon).hexdigest())


if __name__ == '__main__':
    main()
