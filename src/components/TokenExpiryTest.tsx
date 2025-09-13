/**
 * Token过期测试组件
 * 用于测试token过期自动跳转功能
 */

import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { apiInterceptor } from '../services/apiInterceptor';

const TokenExpiryTest: React.FC = () => {
    const { isAuthenticated, token } = useAuth();
    const [loading, setLoading] = useState(false);

    // 模拟token过期的API调用
    const simulateTokenExpiry = async () => {
        setLoading(true);
        try {
            // 创建一个会返回401错误的模拟请求
            const response = await fetch('/api/simulate-token-expiry', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // 手动触发token过期检测
            if (response.status === 401) {
                const errorData = { error: 'token过期', code: 401 };
                await apiInterceptor.handleResponse(response);
            }
        } catch (error) {
            console.log('模拟token过期测试完成');
        }
        setLoading(false);
    };

    // 测试云函数调用中的token过期
    const testCloudFunctionTokenExpiry = async () => {
        setLoading(true);
        try {
            // 这里可以调用一个会返回token过期错误的云函数
            // 或者手动触发token过期处理
            message.info('测试云函数token过期处理...');
            
            // 模拟一个会触发token过期的云函数调用
            const mockCall = async () => {
                throw new Error('用户未登录，请先登录');
            };

            await apiInterceptor.callFunctionWithInterceptor(mockCall);
        } catch (error) {
            console.log('云函数token过期测试完成');
        }
        setLoading(false);
    };

    if (!isAuthenticated) {
        return (
            <Card title="Token过期测试" className="m-4">
                <p>请先登录以测试token过期功能</p>
            </Card>
        );
    }

    return (
        <Card title="Token过期测试" className="m-4">
            <div className="space-y-4">
                <p>当前token: {token ? `${token.substring(0, 20)}...` : '无'}</p>
                
                <div className="space-x-2">
                    <Button 
                        type="primary" 
                        onClick={simulateTokenExpiry}
                        loading={loading}
                    >
                        测试HTTP请求Token过期
                    </Button>
                    
                    <Button 
                        type="default" 
                        onClick={testCloudFunctionTokenExpiry}
                        loading={loading}
                    >
                        测试云函数Token过期
                    </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                    <p>说明：</p>
                    <ul className="list-disc list-inside">
                        <li>点击按钮会模拟token过期的情况</li>
                        <li>系统应该自动检测到token过期并跳转到登录页面</li>
                        <li>同时会显示"登录已过期，请重新登录"的提示</li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default TokenExpiryTest;
