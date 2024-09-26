import React, { useState, useEffect } from 'react';
import { Table as AntTable } from 'antd';
import { classNames } from '../../utilities/commonFunction';
import '../../styles/components/baseComponents/Table.scss';
import { Bars } from 'react-loader-spinner';

export const StudentTable = ({
  className,
  rowClassName,
  columns,
  rowKey,
  data,
  loading,
  onRowClick,
}) => {
  const [dataSource, setDataSource] = useState([]);
  // const [tableColumns, setTableColumns] = useState([]);

  // Set Data
  useEffect(() => {
    setDataSource(data);
  }, [data]);

  // Add Actions and Icon
  // useEffect(() => {
  //     setTableColumns([...columns]);
  // }, [columns]);

  // const isMobileView = window.innerWidth <= 1260;

  return (
    <div className={classNames('table', className ? className : '')}>
      <AntTable
        columns={columns}
        // rowKey={rowKey}
        // rowClassName={rowClassName}
        sortDirections={['ascend', 'descend', 'ascend']}
        showSorterTooltip={false}
        dataSource={dataSource}
        // showHeader={isMobileView ? false : true}
        loading={{
          indicator: (
            <>
              <Bars
                height="25"
                width="25"
                color="#00D090"
                ariaLabel="bars-loading"
                wrapperStyle={{}}
                wrapperClass="pt-1 sm:pt-2 justify-center"
                visible={true}
              />
            </>
          ),
          spinning: loading,
        }}
        pagination={false}
        locale={{
          emptyText: 'No Data',
        }}
        onChange={() => null}
        onRow={onRowClick ? onRowClick : () => null}
      />
    </div>
  );
};
