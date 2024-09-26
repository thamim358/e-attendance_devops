import React, { useState, useEffect } from 'react';
import { Table as AntTable } from 'antd';
import { Bars } from 'react-loader-spinner';
import { classNames } from '../../utilities/commonFunction';
import '../../styles/components/baseComponents/Table.scss';

export const Table = ({
  className,
  rowClassName,
  columns,
  rowKey,
  data,
  loading,
  onRowClick,
  isFiltered
}) => {
  const [dataSource, setDataSource] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);

  useEffect(() => {
    setDataSource(data);
  }, [data]);

  useEffect(() => {
    setTableColumns([...columns]);
  }, [columns]);

  const isMobileView = window.innerWidth <= 1260;

  const getEmptyText = () => {
   if (loading) {
      return '';
    } else if (!isFiltered && dataSource.length === 0) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-gray-500">Apply filters to view data in the table</span>
        </div>
      );
    } else if (isFiltered && dataSource.length === 0) {
      return 'No data';
    }
    return null;
  };

  return (
    <div className={classNames('table', className ? className : '')}>
      <AntTable
        columns={tableColumns}
        rowKey={rowKey}
        rowClassName={rowClassName}
        sortDirections={['ascend', 'descend', 'ascend']}
        showSorterTooltip={false}
        dataSource={dataSource}
        showHeader={isMobileView ? false : true}
        loading={{
          indicator: (
            <>
              <div className="absolute inset-60 grid place-items-center">
                <Bars
                  height="25"
                  width="25"
                  color="#B30537"
                  ariaLabel="bars-loading"
                  wrapperStyle={{}}
                  wrapperClass="pt-1 sm:pt-2 flex justify-center items-center"
                  visible={true}
                />
              </div>
            </>
          ),
          spinning: loading,
        }}
        pagination={false}
        locale={{
          emptyText: getEmptyText(),
        }}
        onChange={() => null}
        onRow={onRowClick ? onRowClick : () => null}
      />
    </div>
  );
};
