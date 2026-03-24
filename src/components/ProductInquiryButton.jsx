export default function ProductInquiryButton({ href, label = "Message us" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cloud-500 to-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:from-cloud-700 hover:to-cloud-700"
    >
      {label}
    </a>
  );
}
