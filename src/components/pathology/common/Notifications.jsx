export function Notifications({ error, success }) {
    return (
        <>
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="mx-4 mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-600 dark:text-green-400">
                        {success}
                    </p>
                </div>
            )}
        </>
    );
}
