export default function HomepTrustBanner() {
  return (
    <div className="w-full bg-[#C2F8D1] rounded-3xl p-10 my-15 flex flex-col md:flex-row justify-between items-center gap-10">

      {/* LEFT SECTION */}
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-bold text-black">
          We’re MySite
        </h1>

        <p className="text-gray-700 leading-relaxed">
          We’re a review platform that’s open to everyone. Our vision is to
          become the universal symbol of trust — by empowering people to shop
          with confidence, and helping companies improve.
        </p>

        <button className="bg-black text-white px-6 py-2 rounded-full font-medium">
          What we do
        </button>
      </div>

      {/* RIGHT CARD */}
      <div className="bg-[#004B2D] text-white p-6 rounded-2xl w-full md:w-[420px] relative overflow-visible">

        <h2 className="text-lg font-semibold">
          Our new Trust Report has landed!
        </h2>

        <p className="text-gray-200 text-sm mt-2 leading-relaxed">
          The actions we’ve taken to protect you and promote trust on our platform.
        </p>



        

      </div>
    </div>
  );
}
