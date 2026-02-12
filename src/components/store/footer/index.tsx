"use client";

import Image from "next/image";
import Link from "next/link";

const CATEGORIES = ["Netflix", "Adobe", "Google", "Microsoft", "Spotify", "Canva", "AI"];
const CUSTOMER_SERVICES = ["Chính sách bảo mật", "Chính sách hoàn tiền", "Điều khoản dịch vụ"];

const Footer = () => {
  return (
    <footer>
      <Image src="/images/footer.svg" alt="Footer Image" width={1920} height={30} className="translate-y-0.5" />
      <div className="bg-[#192b37]">
        <div className="container mx-auto py-10">
          <div className="flex-col">
            <section className="grid lg:grid-cols-4 grid-cols-1 gap-8">
              <div>
                <h3 className="text-lg text-white! font-medium uppercase">Liên hệ</h3>
                <ul className="text-[#fff9] text-sm space-y-2 mt-4 font-semibold">
                  <li>SĐT: 0377196605</li>
                  <li>Địa chỉ: Hải Châu, Đà Nẵng, Việt Nam</li>
                  <li>Email: vthcvn@gmail.com</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg text-white! font-medium uppercase">Danh mục</h3>
                <ul className="text-[#fff9] text-sm space-y-2 mt-4 font-semibold">
                  {CATEGORIES.map((item) => (
                    <li key={item}>
                      <Link href={""}>{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg text-white! font-medium uppercase">Chính sách và điều khoản</h3>
                <ul className="text-[#fff9] text-sm space-y-2 mt-4 font-semibold">
                  {CUSTOMER_SERVICES.map((item) => (
                    <li key={item}>
                      <Link href={""}>{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg text-white! font-medium uppercase">Dịch vụ khách hàng</h3>
                <ul className="text-[#fff9] text-sm space-y-2 mt-4 font-semibold">
                  <li>Từ 8:00 - 23:00 hằng ngày</li>
                  <li>Phản hồi trong 10 phút</li>
                  <li></li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Image
                    src="https://www.gamsgo.com/images/footer/google-safe.webp"
                    width={100}
                    height={40}
                    className="w-auto"
                    alt="Google Safe"
                  />

                  <Image
                    src="https://www.gamsgo.com/images/footer/TrustedSite.webp"
                    width={80}
                    height={40}
                    alt="Google Safe"
                    className="w-auto"
                  />

                  <Image
                    src="https://shield.sitelock.com/shield/gamsgo.com"
                    width={80}
                    height={40}
                    alt="Google Safe"
                    className="w-auto"
                  />

                  <Image
                    src="https://www.gamsgo.com/images/footer/google-ssl.webp"
                    width={80}
                    height={40}
                    alt="Google Safe"
                    className="w-auto"
                  />
                  <Image
                    src="https://www.gamsgo.com/images/footer/pci-dss-compliant.webp"
                    width={80}
                    height={40}
                    alt="Google Safe"
                    className="w-auto"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="bg-[#001522] py-10">
        <div className="flex justify-center gap-2">
          <Image
            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle-1024x1024.png"
            width={44}
            height={44}
            alt="momo"
            className="w-20 h-20 p-4 object-contain grayscale"
            unoptimized
          />
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Logo_TPBank.svg/2560px-Logo_TPBank.svg.png"
            width={44}
            height={44}
            alt="momo"
            className="w-20 h-20 p-4 object-contain grayscale"
            unoptimized
          />
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4OGDffm88naSCEqDH3fV1GljafXzX2GkERw&s"
            width={44}
            height={44}
            alt="momo"
            className="w-20 h-20 p-4 object-contain grayscale"
            unoptimized
          />
        </div>
        <p className="text-center text-xs text-[#fff9] py-2">Bản quyền thuộc về HuthShop.</p>
      </div>
    </footer>
  );
};

export default Footer;
