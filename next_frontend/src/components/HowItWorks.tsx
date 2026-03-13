const steps = [
  {
    number: "1",
    title: "Enter Your Location",
    description: "Tell us your area or pincode",
    color: "bg-blue-100 text-blue-600",
  },
  {
    number: "2",
    title: "Browse & Select",
    description: "Find shops or services near you",
    color: "bg-purple-100 text-purple-600",
  },
  {
    number: "3",
    title: "Place Order",
    description: "Order products or book services",
    color: "bg-green-100 text-green-600",
  },
  {
    number: "4",
    title: "Get It Fast",
    description: "Delivery in minutes to your door",
    color: "bg-orange-100 text-orange-600",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500">Get started in just 4 simple steps</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex flex-col items-center text-center relative">
              {/* Connector line (only between steps on desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-9 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-gray-100 z-0" />
              )}
              <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold ${step.color} shadow-md mb-5`}>
                {step.number}
              </div>
              <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
