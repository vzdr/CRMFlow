import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#141414]">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Welcome to CRMFlow
        </h1>
        <p className="text-center text-gray-300 mb-8">
          The Visual IDE for Building Intelligent Voice-Driven Workflows
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mb-16">
          <Link
            href="/studio"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg overflow-hidden transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
          >
            <span className="relative z-10 flex items-center gap-2">
              Open Flow Studio
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </Link>
        </div>

        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left gap-4">
          <div className="group rounded-lg border border-gray-700 bg-gray-800/50 px-5 py-4 transition-colors hover:border-gray-600 hover:bg-gray-700/50">
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Visual Builder{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm text-gray-400">
              Drag-and-drop interface for creating conversational AI workflows
            </p>
          </div>

          <div className="group rounded-lg border border-gray-700 bg-gray-800/50 px-5 py-4 transition-colors hover:border-gray-600 hover:bg-gray-700/50">
            <h2 className="mb-3 text-2xl font-semibold text-white">
              AI-Powered{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm text-gray-400">
              Powered by Google Gemini for intelligent voice interactions
            </p>
          </div>

          <div className="group rounded-lg border border-gray-700 bg-gray-800/50 px-5 py-4 transition-colors hover:border-gray-600 hover:bg-gray-700/50">
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Integrations{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm text-gray-400">
              Connect with SAP, Qlay, Google APIs, and more
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
