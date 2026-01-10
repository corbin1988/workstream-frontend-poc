export default function BottomNavigation() {
    return (
        <>
            <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-full bottom-4 left-1/2">
                <div className="grid h-full max-w-lg grid-cols-5 mx-auto">

                    <button
                        data-tooltip-target="tooltip-home"
                        type="button"
                        className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                        <svg
                            className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
                            />
                        </svg>
                        <span className="sr-only">Home</span>
                    </button>

                    <div
                        id="tooltip-home"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-sm opacity-0 tooltip"
                    >
                        Home
                        <div className="tooltip-arrow" data-popper-arrow />
                    </div>

                    <button
                        data-tooltip-target="tooltip-wallet"
                        type="button"
                        className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                        <svg
                            className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 8H5m12 0a1 1 0 0 1 1 1v2.6M17 8l-4-4M5 8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.6M5 8l4-4 4 4m6 4h-4a2 2 0 1 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"
                            />
                        </svg>
                        <span className="sr-only">Wallet</span>
                    </button>

                    <div
                        id="tooltip-wallet"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-sm opacity-0 tooltip"
                    >
                        Wallet
                        <div className="tooltip-arrow" data-popper-arrow />
                    </div>

                    <div className="flex items-center justify-center">
                        <button
                            data-tooltip-target="tooltip-new"
                            type="button"
                            className="inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg rounded-full w-8 h-8 focus:outline-none"
                        >
                            <svg
                                className="w-6 h-6"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 12h14m-7 7V5"
                                />
                            </svg>
                            <span className="sr-only">New item</span>
                        </button>
                    </div>

                    <div
                        id="tooltip-new"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-sm opacity-0 tooltip"
                    >
                        Create new item
                        <div className="tooltip-arrow" data-popper-arrow />
                    </div>

                    <button
                        data-tooltip-target="tooltip-settings"
                        type="button"
                        className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                        <svg
                            className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="2"
                                d="M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2"
                            />
                        </svg>
                        <span className="sr-only">Settings</span>
                    </button>

                    <div
                        id="tooltip-settings"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-sm opacity-0 tooltip"
                    >
                        Settings
                        <div className="tooltip-arrow" data-popper-arrow />
                    </div>

                    <button
                        data-tooltip-target="tooltip-profile"
                        type="button"
                        className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                        <svg
                            className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                        </svg>
                        <span className="sr-only">Profile</span>
                    </button>

                    <div
                        id="tooltip-profile"
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-sm opacity-0 tooltip"
                    >
                        Profile
                        <div className="tooltip-arrow" data-popper-arrow />
                    </div>

                </div>
            </div>

        </>
    )
}