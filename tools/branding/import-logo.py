import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import xml.etree.ElementTree as ET

NAMESPACE = '{http://www.w3.org/2000/svg}'
LETTERS = ['G', 'A', 'T', 'I', 'F', 'Y', 'shine']


def scalar_track(animation, default):
    if animation is None:
        return {'times': [0, 1], 'values': [default, default]}
    times = [float(value) for value in animation.attrib['keyTimes'].split(';')]
    values = [float(value.split()[0]) for value in animation.attrib['values'].split(';')]
    if len(times) != len(values) or times[0] != 0 or times[-1] != 1 or times != sorted(times):
        raise ValueError('LOGO_KEYFRAMES_INVALID')
    return {'times': times, 'values': values}


def translation_track(animation, axis):
    if animation is None:
        return {'times': [0, 1], 'values': [0, 0]}
    track = scalar_track(animation, 0)
    track['values'] = [float(value.split()[axis]) for value in animation.attrib['values'].split(';')]
    return track


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('--resvg-module', required=True)
    options = parser.parse_args()
    repository = Path(__file__).resolve().parents[2]
    source = Path(options.source).read_bytes()
    root = ET.fromstring(source)
    allowed_tags = {'svg', 'title', 'desc', 'style', 'defs', 'linearGradient', 'stop', 'clipPath', 'g', 'path', 'animate', 'animateTransform'}
    for element in root.iter():
        if element.tag.removeprefix(NAMESPACE) not in allowed_tags:
            raise ValueError('LOGO_ELEMENT_REFUSED')
        for name, value in element.attrib.items():
            if name.lower().startswith('on') or ('href' in name and not value.startswith('#')):
                raise ValueError('LOGO_EXTERNAL_CONTENT_REFUSED')
    if b'<!DOCTYPE' in source or b'@import' in source:
        raise ValueError('LOGO_EXTERNAL_CONTENT_REFUSED')
    animated = root.find(f".//{NAMESPACE}g[@class='gt-animated']")
    if animated is None or len(animated) != len(LETTERS):
        raise ValueError('LOGO_STRUCTURE_INVALID')
    shapes = []
    for name, group in zip(LETTERS, animated, strict=True):
        opacity = group.find(f"{NAMESPACE}animate[@attributeName='opacity']")
        translation = group.find(f".//{NAMESPACE}animateTransform[@type='translate']")
        scale = group.find(f".//{NAMESPACE}animateTransform[@type='scale']")
        path = group.find(f'.//{NAMESPACE}path')
        if path is None:
            raise ValueError('LOGO_PATH_MISSING')
        shapes.append({'name': name, 'path': path.attrib['d'], 'opacity': scalar_track(opacity, 1), 'translateX': translation_track(translation, 0), 'translateY': translation_track(translation, 1), 'scaleX': scalar_track(scale, 1), 'pivotX': 565 if name == 'A' else 0})
    animations = root.findall(f'.//{NAMESPACE}animate') + root.findall(f'.//{NAMESPACE}animateTransform')
    for animation in animations:
        if animation.attrib.get('dur') != '8s' or any(curve != '.22 1 .36 1' for curve in animation.attrib['keySplines'].split(';')):
            raise ValueError('LOGO_TIMING_UNSUPPORTED')
    ink = root.attrib['style'].split('color:')[1].split(';')[0]
    stops = root.findall(f'.//{NAMESPACE}linearGradient/{NAMESPACE}stop')
    data = {'viewBox': root.attrib['viewBox'], 'width': 1400, 'height': 410, 'durationMs': 8000, 'ink': ink, 'easing': [0.22, 1, 0.36, 1], 'stops': [{'offset': stop.attrib['offset'], 'color': stop.attrib['stop-color'], 'opacity': float(stop.attrib['stop-opacity'])} for stop in stops], 'shapes': shapes}
    asset = repository / 'assets/brand/gatify-animated.svg'
    asset.parent.mkdir(parents=True, exist_ok=True)
    asset.write_bytes(source)
    output = repository / 'src/shared/branding/gatifyLogoData.ts'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text('export const gatifyLogoData = '+json.dumps(data, ensure_ascii=False, indent=2)+' as const;\n', encoding='utf-8')
    subprocess.run(['node', str(repository / 'node_modules/prettier/bin/prettier.cjs'), '--write', str(output)], cwd=repository, check=True)
    api = repository.parent / 'business-api'
    if api.is_dir():
        public = api / 'public/brand/gatify-animated.svg'
        public.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(asset, public)
    subprocess.run(['node', str(repository / 'tools/branding/render-logo.cjs'), options.resvg_module], cwd=repository, check=True)
    print('SVG importat, SHA256 '+hashlib.sha256(source).hexdigest())


if __name__ == '__main__':
    main()
