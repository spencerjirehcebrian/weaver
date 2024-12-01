import typer
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from .collector import CodeCollector
from .config import CollectorConfig
from typing import Optional, List
from .utils.patterns import get_pattern_categories

app = typer.Typer(help="Weaver - A terminal app for the Weaver Platform")
console = Console()

@app.command()
def collect(
    directory: Path = typer.Option(
        ".", "--directory", "-d",
        help="Directory to search for code files"
    ),
    extensions: Optional[List[str]] = typer.Option(
        None, "--extensions", "-e",
        help="File extensions to include (comma-separated)"
    ),
    exclude: Optional[List[str]] = typer.Option(
        None, "--exclude", "-x",
        help="Patterns to exclude (comma-separated)"
    ),
    no_default_excludes: bool = typer.Option(
        False, "--no-default-excludes", "-a",
        help="Disable default exclusions"
    ),
    verbose: bool = typer.Option(
        False, "--verbose", "-v",
        help="Show detailed configuration information"
    ),
    show_patterns: bool = typer.Option(
        False, "--show-patterns", "-p",
        help="Show default exclusion patterns"
    ),
    show_extensions: bool = typer.Option(
        False, "--show-extensions", "-s",
        help="Show default file extensions"
    ),
    show_help: bool = typer.Option(
        False, "--help-examples", "-h",
        help="Show usage examples"
    ),
) -> None:
    """
    Collect and transmit code files with a beautiful interface
    """
    # If any help flag is set, show the requested information and return
    if show_patterns or show_extensions or show_help:
        if show_extensions or show_help:
            # Create extensions table
            ext_table = Table(title="Default File Extensions", show_header=True)
            ext_table.add_column("Extension", style="cyan")
            ext_table.add_column("Description", style="white")

            extension_descriptions = {
                ".py": "Python source files",
                ".sh": "Shell scripts",
                ".yml": "YAML configuration files",
                ".yaml": "YAML configuration files",
                ".js": "JavaScript source files",
                ".jsx": "React JavaScript files",
                ".java": "Java source files",
                ".cpp": "C++ source files",
                ".c": "C source files",
                ".h": "C/C++ header files",
                ".hpp": "C++ header files",
                ".cs": "C# source files",
                ".html": "HTML files",
                ".css": "CSS style files",
                ".tsx": "TypeScript React files",
                ".ts": "TypeScript source files",
                ".go": "Go source files",
                ".rb": "Ruby source files",
                ".php": "PHP source files",
                ".scala": "Scala source files",
                ".rs": "Rust source files",
                ".swift": "Swift source files"
            }

            for ext in sorted(CollectorConfig.DEFAULT_EXTENSIONS):
                ext_table.add_row(ext, extension_descriptions.get(ext, "Source files"))

            console.print(ext_table)
            console.print()

        if show_patterns or show_help:
            # Create patterns table
            patterns_table = Table(title="Default Exclusion Patterns", show_header=True)
            patterns_table.add_column("Category", style="cyan")
            patterns_table.add_column("Patterns", style="white")

            for category, patterns in get_pattern_categories().items():
                patterns_str = "\n".join(sorted(patterns))
                patterns_table.add_row(category, patterns_str)

            console.print(patterns_table)
            console.print()

        if show_help:
            # Print usage examples
            console.print(Panel(
                "[bold blue]Usage Examples:[/bold blue]\n\n"
                "1. Collect all code files in current directory:\n"
                "   [cyan]weaver[/cyan]\n\n"
                "2. Collect from specific directory with custom extensions:\n"
                "   [cyan]weaver -d ./src -e .py,.js,.ts[/cyan]\n\n"
                "3. Exclude specific patterns:\n"
                "   [cyan]weaver --exclude tests/,*.test.js[/cyan]\n\n"
                "4. Disable default exclusions:\n"
                "   [cyan]weaver --no-default-excludes[/cyan]\n\n"
                "5. Show verbose output:\n"
                "   [cyan]weaver --verbose[/cyan]",
                title="Help Information",
                border_style="blue"
            ))
        return

    # Normal collection process
    config = CollectorConfig(
        search_dir=directory,
        extensions=set(extensions) if extensions else CollectorConfig.DEFAULT_EXTENSIONS,
        exclude_patterns=set(exclude) if exclude else set(),
        use_default_excludes=not no_default_excludes,
        verbose=verbose,
    )

    collector = CodeCollector(config, console)
    collector.collect_and_send()

if __name__ == "__main__":
    app()