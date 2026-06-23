const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
          <footer className="bg-white border-t border-gray-200 mt-auto py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                  <p className="text-sm text-gray-500">
                                              &copy; {currentYear} Personal Finance Tracker. All rights reserved.
                                  </p>p>
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                              <span>Built with React &amp; Tailwind CSS</span>span>
                                  </div>div>
                        </div>div>
                </div>div>
          </footer>footer>
        );
};

export default Footer;</footer>
