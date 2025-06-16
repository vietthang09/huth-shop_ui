import Button from "@/components/UI/button";

export default function Partnership() {
  return (
    <div className="h-full flex items-center justify-center gap-10">
      <img src="https://www.g2g.com/img/affiliate-home.webp" className="max-w-44" />
      <div className="text-white">
        <h2 className="text-2xl font-semibold">20% Commission. Lifetime Earnings. Zero Cost.</h2>
        <p>Refer new users today and earn 20% commission every time they shop for life!</p>
      </div>
      <Button>Become a Partner</Button>
    </div>
  );
}
