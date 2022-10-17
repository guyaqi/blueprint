
import ast, sys
import json
from typing import Any, Dict, NamedTuple

def filter_no_none(i: Any):
  return not (i is None)

ignore_names = [
  "lineno",
  "col_offset",
  "end_lineno",
  "end_col_offset",
]

def _to_dict(o: Any):
  d: Dict = o.__dict__
  d['__python_type_name'] = type(o).__name__
  for k, v in d.items():
    if isinstance(v, list):
      d[k] = [_to_dict(i) for i in list(filter(filter_no_none, v))]
    elif v is None or isinstance(v, int) or isinstance(v, str):
      pass
    elif type(v).__name__ == 'ellipsis':
      d[k] = { 'ellipsis': True }
    elif type(v).__name__ == 'bytes':
      d[k] = { '__python_bytes': [x for x in v] }
    elif hasattr(v, '__dict__'):
      d[k] = _to_dict(v)
    else:
      raise Exception(f'NON_DICT {v}')
      d[k] = f'NON_DICT {v}'
      pass
  for x in ignore_names:
    if d.get(x) is not None:
      d.pop(x)
  return d

if __name__ == '__main__':
  if len(sys.argv) < 2:
    print('no module path provided')
    exit()
  if not (sys.argv[1].endswith('.py') or sys.argv[1].endswith('.pyi')):
    print('file provided is not py module')
    exit()
  mod_path = sys.argv[1]
  root_node = ast.parse(open(mod_path).read())
  d = _to_dict(root_node)
  j = json.dumps(d)
  print(j)