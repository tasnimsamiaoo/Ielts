import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Code2, Copy, Check, ExternalLink, Globe } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  module: 'System' | 'Listening' | 'Reading' | 'Drills' | 'Calculator' | 'Evaluation' | 'Vocabulary';
  defaultBody?: any;
}

export const ApiExplorerView: React.FC = () => {
  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      path: '/api/ielts/health',
      description: 'Check API status and supported IELTS standards.',
      module: 'System',
    },
    {
      method: 'GET',
      path: '/api/ielts/modules',
      description: 'Get comprehensive metadata and time standards for all 4 IELTS modules.',
      module: 'System',
    },
    {
      method: 'GET',
      path: '/api/ielts/listening/1',
      description: 'Fetch Section 1 Cambridge dialogue, speakers, question count, and scoring rules.',
      module: 'Listening',
    },
    {
      method: 'GET',
      path: '/api/ielts/reading',
      description: 'Fetch academic reading passages with paragraph mappings and question types.',
      module: 'Reading',
    },
    {
      method: 'GET',
      path: '/api/ielts/dictionary/microclimate',
      description: 'Lookup academic lexicon definitions, CEFR bandings, phonetic spellings, and audio pronunciations.',
      module: 'Vocabulary',
    },
    {
      method: 'GET',
      path: '/api/ielts/drills',
      description: 'List all available question-type practice categories.',
      module: 'Drills',
    },
    {
      method: 'POST',
      path: '/api/ielts/calculate-band',
      description: 'Converts raw scores into official IELTS Band scores according to British Council / IDP rules.',
      module: 'Calculator',
      defaultBody: {
        listeningRaw: 32,
        readingRaw: 30,
        writingBand: 6.5,
        speakingBand: 7.0,
        isAcademic: true,
      },
    },
    {
      method: 'POST',
      path: '/api/ielts/evaluate/writing',
      description: 'Evaluates essay text against the official 4-criteria IELTS Band Descriptors.',
      module: 'Evaluation',
      defaultBody: {
        taskType: 2,
        text: 'The rapid proliferation of artificial intelligence has provoked intense debate regarding the global workforce. On the one hand, automation increases efficiency. Furthermore, it creates new opportunities in technology and ethics. Consequently, governments must support lifelong retraining programs.',
        minWords: 250,
      },
    },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0]);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(endpoints[0].defaultBody || {}, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedFlutter, setCopiedFlutter] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: Endpoint) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseOutput(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseOutput(null);
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (selectedEndpoint.method === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const data = await res.json();
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message || 'Failed to fetch API' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const flutterDartCode = `// Flutter Dart HTTP Client for IELTS API
import 'dart:convert';
import 'package:http/http.dart' as http;

class IeltsApiClient {
  final String baseUrl;
  IeltsApiClient({this.baseUrl = 'http://localhost:3000'});

  // Call ${selectedEndpoint.path}
  Future<Map<String, dynamic>> ${selectedEndpoint.path
    .replace('/api/ielts/', '')
    .replace(/\//g, '_')
    .replace(/-/g, '_')}() async {
    final url = Uri.parse('$baseUrl${selectedEndpoint.path}');
    ${
      selectedEndpoint.method === 'GET'
        ? `final response = await http.get(url, headers: {'Content-Type': 'application/json'});`
        : `final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(${requestBody.trim() || '{}'}),
    );`
    }

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      throw Exception('Failed to load IELTS API: \${response.statusCode}');
    }
  }
}`;

  const handleCopyFlutter = () => {
    navigator.clipboard.writeText(flutterDartCode);
    setCopiedFlutter(true);
    setTimeout(() => setCopiedFlutter(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100/60 dark:bg-slate-950/70 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Open IELTS Practice REST API & Flutter SDK Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Free built-in endpoints covering Listening, Reading, Writing, Speaking, and Official Band Scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            ● Server Online (/api/ielts/*)
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Endpoint List */}
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 overflow-y-auto space-y-1.5 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
            Available API Endpoints
          </div>

          {endpoints.map((ep, idx) => {
            const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
            return (
              <button
                key={idx}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {ep.path}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {ep.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Center: Live Request & Response Console */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-5 bg-slate-50 dark:bg-slate-950">
          {/* Active Endpoint Info */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`text-xs font-bold font-mono px-2 py-1 rounded-lg ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                {selectedEndpoint.path}
              </span>
            </div>

            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Executing...' : 'Send Live Request'}</span>
            </button>
          </div>

          {/* Request Body (if POST) */}
          {selectedEndpoint.method === 'POST' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                JSON Request Payload:
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={5}
                className="w-full p-3 font-mono text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Response Console */}
          <div className="space-y-1.5 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-500" />
                <span>Live Server Response (JSON):</span>
              </span>
              {responseOutput && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  HTTP 200 OK
                </span>
              )}
            </div>

            <pre className="flex-1 min-h-[180px] p-4 font-mono text-xs rounded-2xl bg-slate-900 text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
              {responseOutput || '// Click "Send Live Request" above to test the real server response'}
            </pre>
          </div>

          {/* Flutter Dart Client Code Snippet */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ready-to-Use Flutter Dart Client Code
                </span>
              </div>

              <button
                onClick={handleCopyFlutter}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1 transition-colors"
              >
                {copiedFlutter ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFlutter ? 'Copied Dart Code!' : 'Copy Dart Snippet'}</span>
              </button>
            </div>

            <pre className="p-3 font-mono text-[11px] rounded-xl bg-slate-900 text-blue-300 overflow-x-auto border border-slate-800">
              {flutterDartCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
