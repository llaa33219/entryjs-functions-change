(() => {
    // 함수 백업 저장소
    const functionBackups = new Map();
    let isProcessed = false;

    // JavaScript 실행 블록 정의
    Entry.block['eval_block'] = {
        color: '#39C5BB',
        skeleton: 'basic',
        params: [{ type: 'Block', accept: 'string', defaultType: 'text' }],
        paramsKeyMap: { CODE: 0 },
        func(sprite, script) {
            const jsCode = script.getStringValue('CODE', script);
            return eval(jsCode);
        }
    };
    
    Entry.block['eval_value'] = {
        skeleton: 'basic_string_field',
        color: '#DC143C',
        params: [{ type: 'Block', accept: 'string', defaultType: 'text' }],
        paramsKeyMap: { CODE: 0 },
        func(sprite, script) {
            const jsCode = script.getStringValue('CODE', script);
            const p = script.executor.register?.params || [];
            return eval(jsCode);
        }
    };

    // 함수 교체 (원본 로직 그대로)
    function replaceFunctions() {
        if (isProcessed) return;
        
        console.log('[함수 교체] 시작');
        
        // @test@ 함수 교체 (원본과 동일)
        Object.values(Entry.variableContainer.functions_).forEach(func => {
            if (func.block?.template?.includes('@test@')) {
                // 백업
                functionBackups.set(func.id, func.content.toJSON());
                
                const newBlocks = [
                    [
                        { type: func.type === 'value' ? 'function_create_value' : 'function_create', x: 40, y: 40 },
                        { type: 'eval_block', params: [`alert("알람 실행");`] }
                    ]
                ];
                func.content.load(newBlocks);
                Entry.variableContainer.saveFunction(func);
                console.log(`@test@ 함수 ${func.id} 교체됨`);
            }
        });
        
        // @log 함수 교체 (원본과 동일)
        Object.values(Entry.variableContainer.functions_).forEach(func => {
            if (func.block?.template === ' @log %1 ( %2 )@' && func.type === 'value') {
                // 백업
                functionBackups.set(func.id, func.content.toJSON());
                
                func.content.load([
                    [{
                        type: 'function_create_value',
                        x: 40, y: 40,
                        params: [
                            func.content.getThreads()[0]?.getFirstBlock()?.params[0],
                            null, null,
                            {
                                type: 'eval_value',
                                params: ['Math.log(p[1] || 1) / Math.log(p[0] || 10)']
                            }
                        ],
                        statements: [[]]
                    }]
                ]);
                Entry.variableContainer.saveFunction(func);
                console.log(`@log 함수 ${func.id} 교체됨`);
            }
        });
        
        isProcessed = true;
        console.log(`[함수 교체] 완료 - ${functionBackups.size}개 함수 처리됨`);
    }

    // 복원
    function restoreFunctions() {
        if (!isProcessed) return;
        
        console.log('[함수 복원] 시작');
        functionBackups.forEach((backup, funcId) => {
            const func = Entry.variableContainer.functions_[funcId];
            if (func) {
                func.content.load(backup);
                Entry.variableContainer.saveFunction(func);
            }
        });
        functionBackups.clear();
        isProcessed = false;
        console.log('[함수 복원] 완료');
    }

    // 여러 시점에서 교체 시도 (가장 빠른 것이 실행됨)
    Entry.addEventListener('run', replaceFunctions);
    
    // 엔진 상태 변경 감지
    const originalToggleRun = Entry.engine.toggleRun.bind(Entry.engine);
    Entry.engine.toggleRun = function(...args) {
        replaceFunctions(); // 실행 직전에 교체
        return originalToggleRun(...args);
    };

    // 복원은 종료 시
    Entry.addEventListener('beforeStop', restoreFunctions);
    Entry.addEventListener('stop', restoreFunctions);
    
    console.log('[함수 교체 시스템] 다중 타이밍으로 초기화 완료');
})();
