"""
Code Collector - A beautiful terminal app for collecting and transmitting code files.
"""

from .collector import CodeCollector
from .config import CollectorConfig
from importlib.metadata import version, PackageNotFoundError

try:
    __version__ = version("code-collector")
except PackageNotFoundError:
    __version__ = "unknown"

__all__ = ['CodeCollector', 'CollectorConfig', '__version__']
