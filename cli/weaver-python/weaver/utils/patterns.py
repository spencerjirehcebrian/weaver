import re
"""
Default exclusion patterns for the Code Collector.
Organized by category for better maintenance and configuration.
"""

VERSION_CONTROL_PATTERNS = {
    '.git', '.svn', '.hg',
    'package-lock.json',
    '.gitignore',
    '.gitattributes',
    '.gitmodules'
}

DEPENDENCY_PATTERNS = {
    'node_modules',
    'vendor',
    'build',
    'dist',
    'target',
    '.next',
    'venv',
    'env',
    '.env',
    '.venv',
    'virtualenv',
    'pip-wheel-metadata',
    'poetry.lock',
    'yarn.lock'
}

CACHE_PATTERNS = {
    '__pycache__',
    '*.pyc',
    '*.pyo',
    '*.pyd',
    '.pytest_cache',
    '.coverage',
    '.mypy_cache',
    '.ruff_cache',
    '.hypothesis',
    '.tox',
    '.eggs',
    '*.egg-info'
}

TEST_PATTERNS = {
    '*_test.go',
    '*.test.js',
    '*_spec.rb',
    '*Test.java',
    '*_test.py',
    'test_*.py',
    'tests/',
    '__tests__/',
    'testing/'
}

IDE_PATTERNS = {
    '.idea',
    '.vscode',
    '.vs',
    '*.swp',
    '*.swo',
    '*.swn',
    '*.bak',
    '*~',
    '.project',
    '.classpath',
    '.settings',
    '*.sublime-*'
}

COMPILED_PATTERNS = {
    '*.o',
    '*.ko',
    '*.obj',
    '*.elf',
    '*.bin',
    '*.exe',
    '*.dll',
    '*.so',
    '*.dylib',
    '*.class'
}

LOG_PATTERNS = {
    '*.log',
    '*.logs',
    'log/',
    'logs/',
    '*.tmp',
    '*.temp',
    'tmp/',
    'temp/'
}

MEDIA_PATTERNS = {
    '*.ico',
    '*.png',
    '*.jpg',
    '*.jpeg',
    '*.gif',
    '*.svg',
    '*.bmp',
    '*.mp4',
    '*.mov',
    '*.avi',
    '*.mkv',
    '*.mp3',
    '*.wav',
    '*.ogg',
    '*.flac',
    '*.m4a',
    '*.webm',
    '*.wma'
}

DOCUMENTATION_PATTERNS = {
    'docs/',
    'doc/',
    'documentation/',
    '*.md',
    '*.rst',
    '*.txt',
    'LICENSE*',
    'README*',
    'CHANGELOG*',
    'CONTRIBUTING*'
}

# Combine all patterns into a single set
DEFAULT_EXCLUDE_PATTERNS = (
    VERSION_CONTROL_PATTERNS |
    DEPENDENCY_PATTERNS |
    CACHE_PATTERNS |
    TEST_PATTERNS |
    IDE_PATTERNS |
    COMPILED_PATTERNS |
    LOG_PATTERNS |
    MEDIA_PATTERNS |
    DOCUMENTATION_PATTERNS
)

# Patterns that require exact directory matching
DIRECTORY_PATTERNS = {
    'node_modules',
    'venv',
    'env',
    '.git',
    '.svn',
    '.hg',
    '__pycache__',
    'build',
    'dist',
    'target',
    '.next',
}

def get_pattern_categories():
    """
    Returns a dictionary of pattern categories and their patterns.
    Useful for displaying available patterns to users.
    """
    return {
        "Version Control": VERSION_CONTROL_PATTERNS,
        "Dependencies": DEPENDENCY_PATTERNS,
        "Cache": CACHE_PATTERNS,
        "Tests": TEST_PATTERNS,
        "IDE": IDE_PATTERNS,
        "Compiled": COMPILED_PATTERNS,
        "Logs": LOG_PATTERNS,
        "Media": MEDIA_PATTERNS,
        "Documentation": DOCUMENTATION_PATTERNS
    }

def should_exclude(path: str, custom_patterns: set = None) -> bool:
    """
    Check if a path should be excluded based on default and custom patterns.
    
    Args:
        path: The path to check
        custom_patterns: Additional patterns to include in the check
    
    Returns:
        bool: True if the path should be excluded, False otherwise
    """
    patterns = DEFAULT_EXCLUDE_PATTERNS.copy()
    if custom_patterns:
        patterns.update(custom_patterns)
    
    from pathlib import Path
    path_obj = Path(path)
    path_str = str(path_obj)
    
    # Check directory patterns
    for part in path_obj.parts:
        if part in DIRECTORY_PATTERNS:
            return True
    
    # Check file patterns
    for pattern in patterns:
        if '*' in pattern:
            # Convert glob pattern to regex pattern
            regex_pattern = pattern.replace('.', '\.').replace('*', '.*')
            if re.match(regex_pattern, path_str):
                return True
        elif pattern in path_str:
            return True
    
    return False