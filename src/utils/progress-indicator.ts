interface ProgressIndicatorOptions {
  title?: string;
  showProgressBar?: boolean;
  progressBarLength?: number;
  showTimeEstimates?: boolean;
  showPercentage?: boolean;
  showCount?: boolean;
  clearOnComplete?: boolean;
}

export class ProgressIndicator {
  private total: number;
  private current: number = 0;
  private successCount: number = 0;
  private failureCount: number = 0;
  private startTime: number;
  private options: Required<ProgressIndicatorOptions>;

  constructor(total: number, options: ProgressIndicatorOptions = {}) {
    this.total = total;
    this.startTime = Date.now();
    this.options = {
      title: "Processing",
      showProgressBar: true,
      progressBarLength: 20,
      showTimeEstimates: true,
      showPercentage: true,
      showCount: true,
      clearOnComplete: false,
      ...options,
    };

    if (this.options.title) {
      console.log(`\n🔄 ${this.options.title}: ${this.total} items...`);
    }
  }

  /**
   * Update progress and display current status
   */
  update(itemName?: string): void {
    this.current++;
    this.render(itemName);
  }

  /**
   * Mark current item as successful and update progress
   */
  success(itemName?: string): void {
    this.successCount++;
    this.update(itemName);
  }

  /**
   * Mark current item as failed and update progress
   */
  failure(itemName?: string): void {
    this.failureCount++;
    this.update(itemName);
  }

  /**
   * Complete the progress indicator and show final summary
   */
  complete(): void {
    if (this.options.clearOnComplete) {
      process.stdout.write("\r" + " ".repeat(100) + "\r");
    } else {
      process.stdout.write("\n");
    }

    const totalTime = Math.round((Date.now() - this.startTime) / 1000);

    console.log(`\n✅ ${this.options.title} Complete!`);
    console.log(`📊 Results: ${this.successCount} successful, ${this.failureCount} failed`);
    console.log(`⏱️  Total time: ${totalTime}s`);

    if (this.failureCount > 0) {
      console.log(`⚠️  ${this.failureCount} items failed. Check logs for details.`);
    }
  }

  /**
   * Get current progress statistics
   */
  getStats() {
    return {
      current: this.current,
      total: this.total,
      percentage: Math.round((this.current / this.total) * 100),
      successCount: this.successCount,
      failureCount: this.failureCount,
      elapsedTime: Math.round((Date.now() - this.startTime) / 1000),
      estimatedTimeRemaining: this.getEstimatedTimeRemaining(),
    };
  }

  /**
   * Check if processing is complete
   */
  isComplete(): boolean {
    return this.current >= this.total;
  }

  private render(itemName?: string): void {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const remaining = this.getEstimatedTimeRemaining();

    let output = "";

    // Progress bar
    if (this.options.showProgressBar) {
      const filledLength = Math.floor((percentage / 100) * this.options.progressBarLength);
      const emptyLength = this.options.progressBarLength - filledLength;
      const progressBar = "█".repeat(filledLength) + "░".repeat(emptyLength);
      output += `[${progressBar}] `;
    }

    // Percentage
    if (this.options.showPercentage) {
      output += `${percentage}% `;
    }

    // Count
    if (this.options.showCount) {
      output += `(${this.current}/${this.total}) `;
    }

    // Time estimates
    if (this.options.showTimeEstimates) {
      output += `| ${elapsed}s elapsed`;
      if (remaining > 0) {
        output += `, ~${remaining}s remaining`;
      }
    }

    // Current item name
    if (itemName) {
      output += ` - ${itemName}`;
    }

    // Update the line
    process.stdout.write(`\r${output}`);
  }

  private getEstimatedTimeRemaining(): number {
    if (this.current === 0) return 0;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const estimatedTotal = (elapsed / this.current) * this.total;
    return Math.max(0, Math.round(estimatedTotal - elapsed));
  }
}
