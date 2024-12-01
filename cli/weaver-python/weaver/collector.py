from pathlib import Path
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskID
from rich.console import Console
from rich.panel import Panel
from rich.layout import Layout
from rich.live import Live
from rich.align import Align
from rich.table import Table
from rich.style import Style
from rich.columns import Columns
from datetime import datetime
import tempfile
import time
from typing import List, Generator, Optional, TextIO, Dict

from cli.weaver.ui.progress import ProgressManager
from .config import CollectorConfig
from .utils.file_utils import collect_files, count_lines, read_in_chunks
from .utils.http_utils import send_chunk
from .ui.components import FileTree, Statistics

class CodeCollector:
    def __init__(self, config: CollectorConfig, console: Optional[Console] = None):
        self.config = config
        self.console = console or Console()
        self.stats = Statistics()
        self.file_tree = FileTree()
        self.temp_file = None
        self._start_time = None
        self._processed_files = 0
        self._total_files = 0
        self._total_size = 0
        self._current_file = ""
        self.progress_manager = ProgressManager()

    def _create_header(self) -> Panel:
        """Create the main header panel."""
        return Panel(
            Align.center(
                "[bold blue]Code Collection in Progress[/bold blue]\n"
                f"[cyan]Source:[/cyan] {self.config.search_dir.absolute()}"
            ),
            border_style="blue",
            padding=(1, 2)
        )

    def _create_progress_panel(self) -> Panel:
        """Create a panel showing current progress status."""
        if not self._start_time:
            return Panel("Initializing...", title="Status", border_style="blue")

        elapsed = time.time() - self._start_time
        files_per_sec = self._processed_files / elapsed if elapsed > 0 else 0
        
        table = Table.grid(padding=(0, 2))
        table.add_column(style="cyan")
        table.add_column(style="white")
        
        table.add_row(
            "Files Processed:",
            f"{self._processed_files:,} / {self._total_files:,}"
        )
        table.add_row(
            "Processing Rate:",
            f"{files_per_sec:.1f} files/sec"
        )
        table.add_row(
            "Total Size:",
            f"{self._total_size / 1024 / 1024:.1f} MB"
        )
        table.add_row(
            "Elapsed Time:",
            f"{int(elapsed)}s"
        )
        if self._current_file:
            table.add_row(
                "Current File:",
                str(Path(self._current_file).name)
            )

        return Panel(
            table,
            title="[bold blue]Collection Progress[/bold blue]",
            border_style="blue",
            padding=(1, 2)
        )

    def _create_layout(self) -> Layout:
        """Create the main layout for the UI."""
        layout = Layout()
        
        layout.split(
            Layout(name="header", size=5),
            Layout(name="main"),
            Layout(name="footer", size=3)
        )
        
        layout["main"].split_row(
            Layout(name="left"),
            Layout(name="right", ratio=2)
        )
        
        return layout

    def collect_and_send(self) -> None:
        """Main method to collect and send files with enhanced UI."""
        self._start_time = time.time()
        
        # Create main layout
        layout = self._create_layout()
        
        # Initial scan for files
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True
        ) as progress:
            progress.add_task("[cyan]Scanning files...", total=None)
            files = list(collect_files(
                self.config.search_dir,
                self.config.extensions,
                self.config.get_effective_patterns(),
                set()
            ))
            
        if not files:
            self.console.print("[yellow]No files found matching criteria[/yellow]")
            return

        self._total_files = len(files)
        
        # Process files with live UI updates
        with Live(layout, refresh_per_second=4, screen=True) as live:
            try:
                self._process_files_with_ui(files, layout, live)
                self._send_chunks_with_ui(layout, live)
            except KeyboardInterrupt:
                self._cleanup_on_interrupt()
                return

        # Show final summary
        self._display_summary()

    def _process_files_with_ui(self, files: List[Path], layout: Layout, live: Live) -> None:
        """Process files while updating the UI."""
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp_file:
            self.temp_file = temp_file.name
            self._write_metadata(temp_file, files)
            
            for file in files:
                self._current_file = str(file)
                self._process_file(file, temp_file)
                self._processed_files += 1
                
                # Update UI
                layout["header"].update(self._create_header())
                layout["left"].update(self._create_progress_panel())
                layout["right"].update(self.file_tree.generate_tree())
                live.refresh()

    def _send_chunks_with_ui(self, layout: Layout, live: Live) -> None:
        """Send chunks while updating the UI."""
        with open(self.temp_file, 'r') as f:
            chunks = list(read_in_chunks(Path(self.temp_file), self.config.chunk_size))
        
        layout["header"].update(Panel(
            "[bold blue]Uploading Collection[/bold blue]",
            border_style="blue"
        ))
        
        for i, chunk in enumerate(chunks, 1):
            self._current_file = f"Sending chunk {i}/{len(chunks)}"
            layout["left"].update(self._create_progress_panel())
            live.refresh()
            
            if not send_chunk(chunk, self.config.api_endpoint):
                self.console.print("[red]Error sending chunk. Aborting.[/red]")
                return

    def _process_file(self, file: Path, output_file: TextIO) -> None:
        """Process a single file and update statistics."""
        try:
            # Update statistics
            size = file.stat().st_size
            self._total_size += size
            line_count = count_lines(file)
            self.stats.update(file, line_count)
            self.file_tree.add_file(file)

            # Write file header and contents
            rel_path = file.relative_to(self.config.search_dir)
            output_file.write(f"File: {rel_path}\n")
            output_file.write("=" * 80 + "\n")

            with open(file, 'r', encoding='utf-8') as f:
                output_file.write(f.read())
            
            output_file.write("\n\n")

        except Exception as e:
            self.console.print(f"[red]Error processing {file}: {e}[/red]")

    def _write_metadata(self, file: TextIO, files: List[Path]) -> None:
        """Write collection metadata to the output file."""
        abs_path = self.config.search_dir.absolute()
        structure = [str(f.relative_to(self.config.search_dir)) for f in sorted(files)]
        
        file.write("=== Code Collection Metadata ===\n")
        file.write(f"timestamp: {datetime.now().isoformat()}\n")
        file.write(f"source_directory: {abs_path}\n")
        
        if self.config.verbose:
            file.write(f"included_extensions: {sorted(list(self.config.extensions))}\n")
            file.write(f"exclude_patterns: {sorted(list(self.config.get_effective_patterns()))}\n")
        
        file.write("\n=== Directory Structure ===\n")
        for path in structure:
            file.write(f"{path}\n")
        
        file.write("\n=== Files ===\n\n")

    def _cleanup_on_interrupt(self) -> None:
        """Clean up resources on keyboard interrupt."""
        self.console.print("\n[yellow]Collection interrupted by user[/yellow]")
        if self.temp_file:
            try:
                Path(self.temp_file).unlink()
            except Exception:
                pass

    def _display_summary(self) -> None:
        """Display the final collection summary."""
        elapsed = time.time() - self._start_time
        
        summary = Table.grid(padding=1)
        summary.add_column(style="cyan")
        summary.add_column(style="white")
        
        summary.add_row(
            "Total Time:",
            f"{elapsed:.1f} seconds"
        )
        summary.add_row(
            "Average Speed:",
            f"{self._processed_files / elapsed:.1f} files/sec"
        )
        summary.add_row(
            "Total Size:",
            f"{self._total_size / 1024 / 1024:.1f} MB"
        )
        
        self.console.print("\n[bold green]Collection Complete![/bold green]")
        self.console.print(Panel(
            summary,
            title="[bold blue]Collection Summary[/bold blue]",
            border_style="blue"
        ))
        self.console.print(self.stats.generate_panel())
        self.console.print(self.file_tree.generate_tree())