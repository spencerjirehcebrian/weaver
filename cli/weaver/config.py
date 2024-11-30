from pathlib import Path
from typing import Set, ClassVar
from pydantic import BaseModel, Field
from .utils.patterns import DEFAULT_EXCLUDE_PATTERNS, get_pattern_categories

class CollectorConfig(BaseModel):
    """Configuration for the code collector."""
    
    # Properly annotate class variable with ClassVar
    DEFAULT_EXTENSIONS: ClassVar[Set[str]] = {
        '.py', '.sh', '.yml', '.yaml', '.js', '.jsx', '.java',
        '.cpp', '.c', '.h', '.hpp', '.cs', '.html', '.css',
        '.tsx', '.ts', '.go', '.rb', '.php', '.scala', '.rs', '.swift'
    }
    
    output_file: str = Field(
        default="collected_code.txt",
        description="Output file path for collected code"
    )
    
    search_dir: Path = Field(
        default=Path("."),
        description="Directory to search for code files"
    )
    
    extensions: Set[str] = Field(
        default_factory=lambda: CollectorConfig.DEFAULT_EXTENSIONS.copy(),
        description="File extensions to include in collection"
    )
    
    exclude_patterns: Set[str] = Field(
        default_factory=set,  # This was empty - should be using DEFAULT_EXCLUDE_PATTERNS
        description="Patterns to exclude from collection"
    )
    
    custom_excludes: Set[str] = Field(
        default_factory=set,
        description="Additional custom patterns to exclude"
    )
    
    use_default_excludes: bool = Field(
        default=True,
        description="Whether to use default exclusion patterns"
    )
    
    api_endpoint: str = Field(
        default="http://weaver-api.spencerjireh.com/api/text",
        description="API endpoint for sending collected code"
    )
    
    chunk_size: int = Field(
        default=1024 * 1024,  # 1MB
        description="Size of chunks for sending data"
    )
    
    verbose: bool = Field(
        default=False,
        description="Whether to show detailed configuration information"
    )

    def get_effective_patterns(self) -> Set[str]:
        """Get the complete set of exclusion patterns to use."""
        patterns = set()
        
        if self.use_default_excludes:
            patterns.update(DEFAULT_EXCLUDE_PATTERNS)
            
        patterns.update(self.custom_excludes)
        return patterns

    def get_pattern_summary(self) -> dict:
        """Get a summary of all exclusion patterns by category."""
        if not self.use_default_excludes:
            return {"Custom": self.custom_excludes}
            
        categories = get_pattern_categories()
        summary = {name: patterns for name, patterns in categories.items()}
        if self.custom_excludes:
            summary["Custom"] = self.custom_excludes
        return summary