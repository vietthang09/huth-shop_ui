import Image from "next/image";
import Link from "next/link";

import { InstagramIcon, LinkedinIcon, XIcon } from "@/components/icons/svgIcons";
import Button from "@/components/UI/button";

const CATEGORIES = ["Netflix", "Adobe", "Google", "Microsoft", "Spotify", "Canva", "AI"];
const CUSTOMER_SERVICES = ["Chính sách bảo mật", "Chính sách hoàn tiền", "Điều khoản dịch vụ"];
const LEGALS = ["Conditions of Use & Sale", "Privacy Notice", "Imprint", "Cookies Notice", "Interest-Based Ads Notice"];

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="flex flex-col border-t bg-white z-50 border-t-gray-300 w-full">
      <div className="flex-col storeContainer">
        {/* Payment Methods */}
        <div className="pt-4 flex items-center gap-4">
          <Image
            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle-1024x1024.png"
            alt="Visa"
            width={50}
            height={30}
            className="w-auto h-8 object-contain"
          />
          <Image
            src="https://th.bing.com/th/id/OIP.GwY-oj14bkDlrxOH8T9J6gAAAA?cb=thvnextc1&rs=1&pid=ImgDetMain"
            alt="MasterCard"
            width={120}
            height={60}
            className="w-auto h-16 object-contain"
          />
          <Image
            src="https://brandlogos.net/wp-content/uploads/2021/10/mb-bank-logo.png"
            alt="PayPal"
            width={50}
            height={30}
            className="w-auto h-16 object-contain"
          />
        </div>
        {/* End Payment Methods */}
        <section className="flex flex-col lg:flex-row items-start justify-between">
          <div>
            <h3 className="text-lg text-gray-900 font-medium mt-9 mb-4">Liên hệ với chúng tôi</h3>
            <span className="text-gray-500 block text-sm leading-5">Có câu hỏi? Gọi cho chúng tôi 24/7</span>
            <h2 className="text-blue-600 font-medium my-2">+84 377196605</h2>
            <span className="text-gray-500 block text-sm leading-5">Hải Châu, Đà Nẵng, Việt Nam</span>
            <span className="text-gray-500 block text-sm leading-5">vthcvn@gmail.com</span>
          </div>
          <div>
            <h3 className="text-lg text-gray-900 font-medium mt-9 mb-4">Danh mục</h3>
            <ul className="p-0 mb-4">
              {CATEGORIES.map((item) => (
                <li
                  key={item}
                  className="text-sm leading-7 transition-all duration-150 hover:text-gray-800 text-gray-700"
                >
                  <Link href={""}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg text-gray-900 font-medium mt-9 mb-4">Dịch vụ khách hàng</h3>
            <ul>
              {CUSTOMER_SERVICES.map((item) => (
                <li
                  key={item}
                  className="text-sm leading-7 transition-all duration-150 hover:text-gray-800 text-gray-700"
                >
                  <Link href={""}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:mb-0 mb-12">
            <h3 className="text-lg text-gray-900 font-medium mt-9 mb-4">Đăng ký nhận bản tin</h3>
            <div className="flex w-auto justify-start">
              <input
                type="text"
                placeholder="email address"
                className="w-[200px] text-sm h-8 rounded-md px-4 border border-gray-300 focus:border-gray-800"
              />
              <Button className="h-8  px-4 ml-2 rounded-md border text-sm border-gray-300 bg-gray-100 text-gray-700  hover:bg-gray-200 active:bg-gray-300 active:text-gray-900">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </div>
      <section className="w-full xl:h-20 bg-gray-100 text-sm">
        <div className="h-full flex-col gap-4 xl:flex-row xl:gap-0 justify-between items-center storeContainer">
          <span className="text-gray-500 mt-6 xl:mt-0">© {CURRENT_YEAR} Cửa hàng BITEX. Bảo lưu mọi quyền.</span>
          <div className="flex gap-4 mb-6 xl:mb-0">
            <Link
              href={"https://www.linkedIn.com"}
              className="fill-gray-400 hover:fill-gray-800 transition-all duration-200"
            >
              <LinkedinIcon width={20} strokeWidth={0} className="fill-inherit" />
            </Link>
            <Link
              href={"https://www.twitter.com"}
              className="fill-gray-400 hover:fill-gray-800 transition-all duration-200"
            >
              <XIcon width={20} className="fill-inherit" />
            </Link>
            <Link
              href={"https://www.instagram.com"}
              className="fill-gray-400 hover:fill-gray-800 transition-all duration-200"
            >
              <InstagramIcon width={20} strokeWidth={0} className="fill-inherit" />
            </Link>
            <Link
              href={"https://www.facebook.com"}
              className="fill-gray-400 hover:fill-gray-800 transition-all duration-200"
            >
              <InstagramIcon width={20} strokeWidth={0} className="fill-inherit" />
            </Link>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
