import Link from "next/link";

type StepId = 1 | 2 | 3 | 4;

type Props = {
  currentStep: StepId;
};

const steps: { id: StepId; label: string; href: string }[] = [
  { id: 1, label: "Service", href: "/book/type" },
  { id: 2, label: "Route", href: "/book/route" },
  { id: 3, label: "Parcel", href: "/book/parcel" },
  { id: 4, label: "Payment", href: "/book/confirm" },
];

const CheckIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="shrink-0" aria-hidden>
    <path d="M1 5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function BookingStepper({ currentStep }: Props) {
  return (
    <div className="relative mx-auto flex max-w-3xl items-center justify-between">
      <div className="absolute left-0 right-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-slate-200 via-primary/25 to-slate-200 dark:from-[#221d38] dark:via-[#7c3aed]/25 dark:to-[#221d38]" aria-hidden />
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isActive = currentStep === step.id;
        const isComplete = step.id < currentStep;

        const circleClass = [
          "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
          isComplete ? "border-accent bg-accent text-white shadow-sm" : "",
          isActive && !isComplete ? "border-accent bg-white text-accent dark:bg-[#0c0b14]" : "",
          !isActive && !isComplete ? "border-slate-300 bg-white text-slate-500 dark:border-[#221d38] dark:bg-[#0c0b14] dark:text-[#9d8ab8]" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const labelClass = [
          "text-[10px] font-bold uppercase tracking-[0.2em]",
          isActive || isComplete ? "text-primary" : "text-slate-400 dark:text-[#8b7aaa]",
        ].join(" ");

        const inner = (
          <div className="flex flex-col items-center gap-3 rounded-md bg-slate-50 px-4 py-3 shadow-sm dark:bg-[#050507] dark:shadow-none">
            <div className={circleClass}>
              {isComplete && <CheckIcon />}
              {!isComplete && (
                <span className="text-[10px] font-bold">
                  {String(step.id).padStart(2, "0")}
                </span>
              )}
            </div>
            <span className={labelClass}>{step.label}</span>
          </div>
        );

        return (
          <div
            key={step.id}
            className="relative z-10 flex flex-1 items-center justify-center"
          >
            {isComplete ? (
              <Link href={step.href} title={`Go back to ${step.label}`}>
                {inner}
              </Link>
            ) : (
              inner
            )}
            {!isLast && <div className="hidden md:block flex-1" />}
          </div>
        );
      })}
    </div>
  );
}
