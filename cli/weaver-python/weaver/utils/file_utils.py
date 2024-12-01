from pathlib import Path
from typing import Set, Generator, List
import re
from .patterns import should_exclude, DEFAULT_EXCLUDE_PATTERNS

def collect_files(
    directory: Path,
    extensions: Set[str],
    exclude_patterns: Set[str],
    default_excludes: Set[str]
) -> Generator[Path, None, None]:
    """
    Collect files from directory that match the given criteria.
    
    Args:
        directory: Root directory to search
        extensions: Set of file extensions to include
        exclude_patterns: Set of patterns to exclude
        default_excludes: Set of default exclusion patterns
    """
    all_excludes = exclude_patterns | default_excludes
    
    for path in directory.rglob("*"):
        # Convert to relative path for consistent pattern matching
        relative_path = str(path.relative_to(directory))
        
        if _should_include(path, relative_path, extensions, all_excludes):
            yield path

def _should_include(
    path: Path,
    relative_path: str,
    extensions: Set[str],
    exclude_patterns: Set[str]
) -> bool:
    """
    Check if a file should be included in collection.
    
    Args:
        path: Path object for the file
        relative_path: Relative path string for pattern matching
        extensions: Allowed file extensions
        exclude_patterns: Patterns to exclude
    """
    if not path.is_file():
        return False
        
    # Check file extension first (fast check)
    if path.suffix not in extensions:
        return False
    
    # Check exclusions
    for pattern in exclude_patterns:
        # Handle glob patterns
        if "*" in pattern:
            # Convert glob to regex
            regex_pattern = pattern.replace(".", "\\.").replace("*", ".*")
            if re.match(f"^{regex_pattern}$", relative_path):
                return False
        # Handle directory/path fragments
        elif pattern in relative_path:
            return False
    
    return True

def count_lines(file_path: Path) -> int:
    """Count number of lines in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return sum(1 for _ in f)
    except Exception:
        return 0

def read_in_chunks(file_path: Path, chunk_size: int) -> Generator[str, None, None]:
    """Read file in chunks of specified size."""
    with open(file_path, 'r') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk