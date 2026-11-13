// 購入手続きの進み具合（例：2 / 4 お届け先）
export function CheckoutSteps({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="steps" aria-label="購入手続きの進み具合">
      {steps.map((label, index) => (
        <li key={label} aria-current={index === current ? 'step' : undefined}>
          {index + 1}. {label}
        </li>
      ))}
    </ol>
  );
}
