declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module 'whatwg-fetch';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

interface IpProxy {
  username: string; // 代理账号
  password: string; // 代理密码
  ip: string; // 代理ip 85.255.129.2-62
  port: number; // 代理端口
  maxConnection: number; // 最大连接数
}

interface Task {
  _id?: string;
  id?: string;
  proxyPool: string;
  status?: string;
  count?: number;
  keyword: string;
  type: number;
  maxRequest: number;
  deep: number;
  forceWhitelist: boolean;
  oneProcess: boolean;
  whitelist: string;
  blacklist: string;
  proxy: boolean;
  ipProxy: IpProxy | string;
}
