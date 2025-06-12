// components/Footer.tsx
import Link from "next/link";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-white py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        {/* サイトナビゲーション */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/calendar" className="hover:text-white transition">
                カレンダー
              </Link>
            </li>
            <li>
              <Link
                href="/menu-generate"
                className="hover:text-white transition"
              >
                献立生成
              </Link>
            </li>
            <li>
              <Link href="/recipes" className="hover:text-white transition">
                レシピ一覧
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-white transition">
                設定
              </Link>
            </li>
          </ul>
        </div>

        {/* ソーシャルアイコン */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a
              href="https://github.com/TonChan0828"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              <FaGithub size={24} />
            </a>
            <a
              href="https://x.com/tonchan0315ton"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              <FaXTwitter size={24} />
            </a>
          </div>
        </div>

        {/* コピーライト */}
        <div className="text-center md:text-right">
          <h4 className="text-lg font-semibold text-white mb-4">About</h4>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} WeeklyDish. <br />
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
