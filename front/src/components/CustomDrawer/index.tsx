import React from 'react';
import { Drawer } from 'antd';
import { DrawerProps } from "antd/es/drawer";

interface Props extends DrawerProps {
  children: React.ReactElement
}

const CustomDrawer: React.FC<Props> = (props: Props) => {
  const { children } = props;
  return (
    <Drawer
      className='form-drawer'
      getContainer={false}
      placement='right'
      maskClosable={false}
      {...props}
    >
      { children }
    </Drawer>
  )
}

export default CustomDrawer;
