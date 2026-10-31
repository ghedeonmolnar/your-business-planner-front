import argparse
import hashlib
from pathlib import Path
import struct
import subprocess

PNG_SIGNATURE = b'\x89PNG\r\n\x1a\n'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('--resvg-module', required=True)
    options = parser.parse_args()
    repository = Path(__file__).resolve().parents[2]
    source = Path(options.source).read_bytes()
    if len(source) < 33 or source[:8] != PNG_SIGNATURE or source[12:16] != b'IHDR':
        raise ValueError('LOGO_PNG_INVALID')
    width, height = struct.unpack('>II', source[16:24])
    if width != height or width < 1024:
        raise ValueError('LOGO_SQUARE_MINIMUM_1024_REQUIRED')
    asset = repository / 'assets/brand/ybp-logo.png'
    asset.parent.mkdir(parents=True, exist_ok=True)
    asset.write_bytes(source)
    subprocess.run(
        ['node', str(repository / 'tools/branding/render-logo.cjs'), options.resvg_module],
        cwd=repository,
        check=True,
    )
    print('PNG importat, SHA256 ' + hashlib.sha256(source).hexdigest())


if __name__ == '__main__':
    main()
