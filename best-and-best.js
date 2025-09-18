(() => {
    // 함수 백업 저장소
    const functionBackups = new Map();
    let isCurrentlyReplaced = false;

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

    // 함수 교체 (description 기반으로 변경)
    function replaceFunctions() {
        if (isCurrentlyReplaced) {
            console.log('[함수 교체] 이미 교체된 상태 - 스킵');
            return;
        }
        
        console.log('[함수 교체] 시작');
        let replacedCount = 0;
        
        // @test@ 함수 교체 (description 기반)
        Object.values(Entry.variableContainer.functions_).forEach(func => {
            if (func.description && func.description.includes('@test@')) {
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
                replacedCount++;
            }
        });
        
        // @log 함수 교체 (description 패턴 매칭)
        Object.values(Entry.variableContainer.functions_).forEach(func => {
            if (func.description && func.type === 'value') {
                // @log 문자/숫자값 ( 문자/숫자값1 )@ 패턴 매칭
                const logPattern = /@log\s+[^(]+\s*\(\s*[^)]+\s*\)@/;
                if (logPattern.test(func.description)) {
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
                    replacedCount++;
                }
            }
        });
        
        if (replacedCount > 0) {
            isCurrentlyReplaced = true;
        } else {
            console.log('[함수 교체] 교체할 함수 없음');
        }
    }

    // 복원
    function restoreFunctions() {
        if (!isCurrentlyReplaced || functionBackups.size === 0) {
            return;
        }
        
        functionBackups.forEach((backup, funcId) => {
            const func = Entry.variableContainer.functions_[funcId];
            if (func) {
                func.content.load(backup);
                Entry.variableContainer.saveFunction(func);
                console.log(`함수 ${funcId} 복원됨`);
            }
        });
        
        functionBackups.clear();
        isCurrentlyReplaced = false;
    }

    // 매번 실행시 교체
    Entry.addEventListener('run', () => {
        replaceFunctions();
    });
    
    // 엔진 toggleRun도
    const originalToggleRun = Entry.engine.toggleRun.bind(Entry.engine);
    Entry.engine.toggleRun = function(...args) {
        replaceFunctions();
        return originalToggleRun(...args);
    };

    // 매번 종료시 복원
    Entry.addEventListener('beforeStop', () => {
        restoreFunctions();
    });
    
    Entry.addEventListener('stop', () => {
        console.log('[함수 교체] 작품 종료 감지');
        restoreFunctions();
    });
})();
