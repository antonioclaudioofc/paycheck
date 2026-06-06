interface AlertProps {
  type: "error" | "success";
  message: string;
  className?: string;
}

export function Alert({ type, message, className = "" }: AlertProps) {
  const styles = {
    error:
      "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400",
    success:
      "bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400",
  };

  const selectedStyle = styles[type] || styles.error;

  return (
    <div
      className={`p-4 rounded-md text-sm text-center font-medium ${selectedStyle} ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
}
export default Alert;
