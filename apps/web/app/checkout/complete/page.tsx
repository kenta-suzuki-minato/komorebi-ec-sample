'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useStore } from '../../_components/StoreProvider';

export default function CompletePage() {
  const { reset } = useStore();

  // 注文を受け付けたら、カートと入力を空にする
  useEffect(() => {
    reset();
  }, []);

  return (
    <>
      <h1>ご注文ありがとうございました</h1>
      <p>ご注文内容の確認メールをお送りします。</p>
      <Link href="/products">買い物を続ける</Link>
    </>
  );
}
