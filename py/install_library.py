# install_library.py

import sys
import subprocess

def install_library(library_name, library_version):
    try:
        subprocess.run(['pip', 'install', f'{library_name}=={library_version}'], check=True)
        print("Success")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python install_library.py <library_name> <library_version>", file=sys.stderr)
        sys.exit(1)
    
    library_name = sys.argv[1]
    library_version = sys.argv[2]
    install_library(library_name, library_version)