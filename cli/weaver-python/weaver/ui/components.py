from rich.tree import Tree
from rich.panel import Panel
from rich.table import Table
from rich.style import Style
from rich.console import Console
from rich.align import Align
from rich.columns import Columns
from rich.layout import Layout
from pathlib import Path
from typing import Dict, Any

class FileTree:
    """Enhanced FileTree with better organization and visual hierarchy."""
    
    def __init__(self):
        self.tree = Tree(
            "[bold blue]📁 Project Files[/bold blue]",
            guide_style="bright_black"
        )
        self._file_count = 0
        self._folder_count = 0
        self.folder_cache = {}
        
    def add_file(self, path: Path) -> None:
        try:
            parts = list(path.relative_to(Path.cwd()).parts)
        except ValueError:
            parts = list(path.parts)
            
        current = self.tree
        current_path = ""
        
        # Process all parts except the last (file) part
        for part in parts[:-1]:
            current_path = str(Path(current_path) / part)
            if current_path in self.folder_cache:
                current = self.folder_cache[current_path]
            else:
                # Create new folder node with custom styling
                folder_label = f"[blue]📁 {part}[/blue]"
                new_node = current.add(folder_label, guide_style="bright_black")
                self.folder_cache[current_path] = new_node
                current = new_node
                self._folder_count += 1
        
        # Add the file with an appropriate icon based on extension
        file_name = parts[-1]
        icon = self._get_file_icon(file_name)
        current.add(f"[white]{icon} {file_name}[/white]", guide_style="bright_black")
        self._file_count += 1

    def _get_file_icon(self, file_name: str) -> str:
        """Return appropriate icon based on file extension."""
        ext = Path(file_name).suffix.lower()
        icons = {
            '.py': '🐍',
            '.js': '📜',
            '.jsx': '⚛️',
            '.ts': '💠',
            '.tsx': '⚛️',
            '.html': '🌐',
            '.css': '🎨',
            '.json': '📋',
            '.md': '📝',
            '.yml': '⚙️',
            '.yaml': '⚙️',
            '.sh': '📜',
            '.rs': '⚙️',
            '.go': '🔷',
            '.java': '☕',
            '.cpp': '⚡',
            '.c': '⚡',
            '.h': '📑',
            '.rb': '💎',
            '.php': '🐘',
        }
        return icons.get(ext, '📄')

    def generate_tree(self) -> Panel:
        """Generate a panel containing the file tree with statistics."""
        stats_text = (
            f"[bold cyan]Total Files:[/bold cyan] {self._file_count}  "
            f"[bold cyan]Total Folders:[/bold cyan] {self._folder_count}"
        )
        
        return Panel(
            Align.left(
                Columns([
                    self.tree,
                    Align.right(stats_text)
                ], expand=True)
            ),
            title="[bold blue]Project Structure[/bold blue]",
            border_style="blue",
            padding=(1, 2)
        )

class Statistics:
    """Enhanced Statistics with better visual organization."""
    
    def __init__(self):
        self.total_files: int = 0
        self.total_lines: int = 0
        self.extensions: Dict[str, Dict[str, Any]] = {}
        
    def update(self, file: Path, lines: int) -> None:
        self.total_files += 1
        self.total_lines += lines
        ext = file.suffix
        
        if ext not in self.extensions:
            self.extensions[ext] = {
                'count': 0,
                'lines': 0,
                'icon': self._get_file_icon(ext)
            }
            
        self.extensions[ext]['count'] += 1
        self.extensions[ext]['lines'] += lines

    def _get_file_icon(self, ext: str) -> str:
        """Return appropriate icon based on file extension."""
        icons = {
            '.py': '🐍',
            '.js': '📜',
            '.jsx': '⚛️',
            '.ts': '💠',
            '.tsx': '⚛️',
            '.html': '🌐',
            '.css': '🎨',
            '.json': '📋',
            '.md': '📝',
            '.yml': '⚙️',
            '.yaml': '⚙️',
        }
        return icons.get(ext.lower(), '📄')

    def generate_panel(self) -> Panel:
        """Generate a panel with enhanced statistics display."""
        table = Table(
            show_header=True,
            header_style="bold blue",
            border_style="bright_black",
            padding=(0, 2)
        )
        
        table.add_column("Category", style="cyan")
        table.add_column("Value", justify="right")
        
        # Add summary statistics
        table.add_row(
            "[bold]Total Files[/bold]",
            f"{self.total_files:,}"
        )
        table.add_row(
            "[bold]Total Lines[/bold]",
            f"{self.total_lines:,}"
        )
        
        # Add separator
        table.add_row("", "")
        
        # Add file type statistics
        if self.extensions:
            table.add_row(
                "[bold]File Types[/bold]",
                ""
            )
            
            # Sort extensions by count
            sorted_exts = sorted(
                self.extensions.items(),
                key=lambda x: x[1]['count'],
                reverse=True
            )
            
            for ext, data in sorted_exts:
                icon = data['icon']
                table.add_row(
                    f"{icon} {ext}",
                    f"{data['count']:,} files ({data['lines']:,} lines)"
                )
        
        return Panel(
            table,
            title="[bold blue]Collection Statistics[/bold blue]",
            border_style="blue",
            padding=(1, 2)
        )