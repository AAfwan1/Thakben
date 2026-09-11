export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f4f0] px-4 pb-24 pt-28 sm:px-6 lg:px-10 lg:pt-32">
      <div className="mx-auto max-w-7xl animate-pulse">

        {/* Back link */}
        <div className="mb-6 h-4 w-32 rounded-full bg-black/10" />

        {/* Gallery */}
        <div className="grid gap-3 lg:grid-cols-[1.5fr_0.75fr]">
          <div className="min-h-[420px] rounded-[30px] bg-black/10 sm:min-h-[520px]" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="min-h-[180px] rounded-[24px] bg-black/10 sm:min-h-[200px]" />
            <div className="min-h-[180px] rounded-[24px] bg-black/10 sm:min-h-[200px]" />
            <div className="min-h-[180px] rounded-[24px] bg-black/10 sm:min-h-[200px]" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Main */}
          <div className="space-y-5">
            <div className="rounded-[28px] bg-white p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <div className="h-3 w-16 rounded-full bg-black/10" />
                  <div className="mt-3 h-5 w-40 rounded-full bg-black/10" />
                </div>

                <div>
                  <div className="h-3 w-12 rounded-full bg-black/10" />
                  <div className="mt-3 h-5 w-24 rounded-full bg-black/10" />
                </div>

                <div>
                  <div className="h-3 w-14 rounded-full bg-black/10" />
                  <div className="mt-3 h-5 w-20 rounded-full bg-black/10" />
                </div>
              </div>

              <div className="my-7 h-px bg-black/10" />

              <div className="h-3 w-32 rounded-full bg-black/10" />

              <div className="mt-4 space-y-2">
                <div className="h-4 w-full rounded-full bg-black/10" />
                <div className="h-4 w-5/6 rounded-full bg-black/10" />
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 sm:p-8">
              <div className="h-3 w-24 rounded-full bg-black/10" />
              <div className="mt-3 h-7 w-48 rounded-full bg-black/10" />

              <div className="mt-7 grid gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-24 rounded-2xl bg-black/10"
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 sm:p-8">
              <div className="h-3 w-20 rounded-full bg-black/10" />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-14 rounded-2xl bg-black/10"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Booking skeleton */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[30px] bg-black p-6 sm:p-7">

              <div className="h-3 w-32 rounded-full bg-white/10" />

              <div className="mt-4 h-8 w-40 rounded-full bg-white/10" />

              <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded-full bg-white/10" />
                <div className="h-3 w-4/5 rounded-full bg-white/10" />
              </div>

              <div className="mt-7 h-24 rounded-2xl bg-white/[0.06]" />

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-20 rounded-2xl bg-white/[0.06]" />
                <div className="h-20 rounded-2xl bg-white/[0.06]" />
                <div className="h-20 rounded-2xl bg-white/[0.06]" />
              </div>

              <div className="mt-5 h-14 rounded-full bg-white/10" />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}