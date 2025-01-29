import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-4xl font-bold text-foreground mt-4">页面未找到</h2>
        <p className="text-muted-foreground mt-2">
          抱歉，您访问的页面不存在。
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 